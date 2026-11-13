<?php

namespace App\Jobs;

use App\Mail\CampaignEmail;
use App\Models\CampaignRecipient;
use App\Models\EmailCampaign;
use App\Models\EmailSendAttempt;
use App\Services\BulkEmailService;
use App\Services\EmailContent;
use App\Services\MarketingAudience;
use Illuminate\Contracts\Queue\ShouldBeUniqueUntilProcessing;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Queue\Middleware\WithoutOverlapping;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\RateLimiter;
use Symfony\Component\Mailer\Exception\TransportExceptionInterface;

class ProcessEmailCampaign implements ShouldBeUniqueUntilProcessing, ShouldQueue
{
    use Queueable;

    public int $tries = 0; // Rate-limit releases do not consume recipient attempts.

    public int $maxExceptions = 3;

    public int $timeout = 60;

    public int $uniqueFor = 600;

    public function uniqueId(): string
    {
        return (string) $this->campaignId;
    }

    public function __construct(public int $campaignId) {}

    public function middleware(): array
    {
        // Serialize bulk transport use across campaigns; SQL claims also protect redelivery.
        return [(new WithoutOverlapping('greenbricks-bulk-mail'))->shared()->releaseAfter(10)->expireAfter(120)];
    }

    public function handle(BulkEmailService $service, MarketingAudience $audience, EmailContent $content): void
    {
        $campaign = EmailCampaign::find($this->campaignId);
        if (! $campaign || ! in_array($campaign->status, ['queued', 'sending'])) {
            return;
        }
        EmailCampaign::whereKey($campaign->id)->where('status', 'queued')->update(['status' => 'sending']);
        $ids = $campaign->recipients()->where('status', 'queued')->where(fn ($q) => $q->whereNull('available_at')->orWhere('available_at', '<=', now()))->orderBy('id')->limit(max(1, min(config('bulk_email.batch_size'), 100)))->pluck('id');
        foreach ($ids as $id) {
            if (! in_array($campaign->fresh()->status, ['queued', 'sending'])) {
                return;
            }
            if (RateLimiter::tooManyAttempts('bulk-email:global', max(1, config('bulk_email.per_minute')))) {
                $service->dispatch($campaign, max(1, RateLimiter::availableIn('bulk-email:global')));

                return;
            }
            $recipient = DB::transaction(function () use ($id) {
                $recipient = CampaignRecipient::lockForUpdate()->find($id);
                if (! $recipient || $recipient->status !== 'queued') {
                    return null;
                }
                $recipient->update(['status' => 'sending', 'claimed_at' => now(), 'attempts' => $recipient->attempts + 1]);
                EmailSendAttempt::create(['recipient_id' => $id, 'number' => $recipient->attempts, 'status' => 'sending']);

                return $recipient;
            });
            if (! $recipient) {
                continue;
            }
            $contact = $recipient->contact()->first();
            if (! $contact || ! $audience->eligible($contact, $recipient->email)) {
                $this->record($recipient, 'skipped', 'Consent withdrawn, address changed, account ineligible or suppressed.');

                continue;
            }
            if (! in_array($campaign->fresh()->status, ['queued', 'sending'])) {
                $this->record($recipient, $campaign->fresh()->status === 'paused' ? 'queued' : 'skipped', 'Campaign paused or cancelled before sending.');

                continue;
            }
            RateLimiter::hit('bulk-email:global', 60);
            try {
                $url = route('marketing.unsubscribe', ['token' => $contact->getRawOriginal('unsubscribe_token')]);
                Mail::to($recipient->email)->send(new CampaignEmail($campaign->subject, $content->render($campaign->body, $recipient->name), $url));
                $this->record($recipient, 'sent', null);
            } catch (\Throwable $error) {
                // Only an explicit SMTP rejection is safe to retry. A timeout or
                // worker crash may occur after acceptance: never resend blindly.
                $code = (int) $error->getCode();
                $explicit = $error instanceof TransportExceptionInterface && $code >= 400 && $code < 600;
                $retry = $explicit && in_array($code, [421, 450, 451, 452]) && $recipient->attempts < max(1, min(config('bulk_email.max_attempts'), 5));
                $this->record($recipient, $retry ? 'queued' : ($explicit ? 'failed' : 'uncertain'), $explicit ? 'SMTP rejected request ('.$code.').'.($retry ? ' Retry scheduled.' : ' Retry limit reached or permanent rejection.') : 'Transport outcome uncertain. Automatic resend disabled; check provider logs.');
            }
        }
        $service->finish($campaign);
        if (in_array($campaign->fresh()->status, ['queued', 'sending']) && $campaign->recipients()->where('status', 'queued')->exists()) {
            $service->dispatch($campaign, 10);
        }
    }

    private function record(CampaignRecipient $recipient, string $status, ?string $error): void
    {
        DB::transaction(function () use ($recipient, $status, $error) {
            $recipient->update(['status' => $status, 'error' => $error, 'available_at' => $status === 'queued' ? now()->addSeconds(max(1, config('bulk_email.retry_delay'))) : null, 'sent_at' => $status === 'sent' ? now() : null]);
            EmailSendAttempt::where('recipient_id', $recipient->id)->where('number', $recipient->attempts)->update(['status' => $status === 'queued' ? 'retry_scheduled' : $status, 'error' => $error, 'updated_at' => now()]);
        });
    }
}
