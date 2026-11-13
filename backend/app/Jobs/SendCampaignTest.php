<?php

namespace App\Jobs;

use App\Mail\CampaignEmail;
use App\Models\EmailAuditLog;
use App\Models\EmailCampaign;
use App\Models\User;
use App\Services\BulkEmailService;
use App\Services\EmailContent;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Queue\Middleware\WithoutOverlapping;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\RateLimiter;

class SendCampaignTest implements ShouldQueue
{
    use Queueable;

    public int $tries = 0;

    public int $maxExceptions = 1;

    public int $timeout = 60;

    public function __construct(public int $campaignId, public int $adminId, public int $requestId) {}

    public function middleware(): array
    {
        return [(new WithoutOverlapping('greenbricks-bulk-mail'))->shared()->releaseAfter(10)->expireAfter(120)];
    }

    public function handle(EmailContent $content, BulkEmailService $service): void
    {
        $admin = User::find($this->adminId);
        $campaign = EmailCampaign::find($this->campaignId);
        if (! $admin || $admin->role !== 'admin' || $admin->is_blocked || ! $admin->email_verified_at || ! filter_var($admin->email, FILTER_VALIDATE_EMAIL) || ! $campaign) {
            return;
        }
        if (RateLimiter::tooManyAttempts('bulk-email:global', max(1, config('bulk_email.per_minute')))) {
            $this->release(max(1, RateLimiter::availableIn('bulk-email:global')));

            return;
        }
        RateLimiter::hit('bulk-email:global', 60);
        if (! EmailAuditLog::whereKey($this->requestId)->where('actor_id', $admin->id)->where('entity_id', $campaign->id)->where('action', 'campaign.test_queued')->where('state', 'queued')->update(['state' => 'sending', 'updated_at' => now()])) {
            return;
        }
        try {
            Mail::to($admin->email)->send(new CampaignEmail($campaign->subject, $content->render($campaign->body, $admin->name), null, true));
            $service->audit($admin->id, 'campaign.test_accepted', 'campaign', $campaign->id);
            EmailAuditLog::whereKey($this->requestId)->update(['state' => 'accepted', 'updated_at' => now()]);
        } catch (\Throwable) {
            $service->audit($admin->id, 'campaign.test_failed_or_uncertain', 'campaign', $campaign->id);
            EmailAuditLog::whereKey($this->requestId)->update(['state' => 'uncertain', 'updated_at' => now()]);
        }
    }
}
