<?php

namespace App\Services;

use App\Jobs\ProcessEmailCampaign;
use App\Models\EmailAuditLog;
use App\Models\EmailCampaign;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class BulkEmailService
{
    public function audit(?int $actor, string $action, string $type, ?int $id): EmailAuditLog
    {
        return EmailAuditLog::create(['actor_id' => $actor, 'action' => $action, 'entity_type' => $type, 'entity_id' => $id]);
    }

    public function dispatch(EmailCampaign $campaign, int $delay = 0): void
    {
        $connection = config('bulk_email.connection');
        if (! in_array(config("queue.connections.$connection.driver"), ['database', 'redis', 'sqs', 'beanstalkd'])) {
            throw ValidationException::withMessages(['queue' => ['Configure an asynchronous bulk email queue connection.']]);
        }
        ProcessEmailCampaign::dispatch($campaign->id)->onConnection($connection)->onQueue(config('bulk_email.queue'))->delay(now()->addSeconds($delay))->afterCommit();
    }

    public function start(EmailCampaign $campaign, int $actor): EmailCampaign
    {
        return DB::transaction(function () use ($campaign, $actor) {
            $campaign = EmailCampaign::lockForUpdate()->findOrFail($campaign->id);
            if ($campaign->status !== 'draft') {
                return $campaign;
            }
            $query = app(MarketingAudience::class)->query($campaign->recipient_group, $campaign->contact_ids ?? []);
            if (! $query->exists()) {
                throw ValidationException::withMessages(['recipients' => ['No eligible, consented recipients match this campaign.']]);
            }
            $query->orderBy('id')->chunkById(500, function ($contacts) use ($campaign) {
                $rows = [];
                foreach ($contacts as $contact) {
                    if (! filter_var($contact->email, FILTER_VALIDATE_EMAIL)) {
                        continue;
                    }
                    $rows[] = ['campaign_id' => $campaign->id, 'contact_id' => $contact->id, 'email' => $contact->email, 'name' => $contact->name, 'status' => 'queued', 'attempts' => 0, 'created_at' => now(), 'updated_at' => now()];
                }
                DB::table('campaign_recipients')->insertOrIgnore($rows);
            });
            if (! $campaign->recipients()->exists()) {
                throw ValidationException::withMessages(['recipients' => ['No valid email addresses match.']]);
            }
            $campaign->update(['status' => 'queued', 'confirmed_at' => now()]);
            $this->audit($actor, 'campaign.confirmed', 'campaign', $campaign->id);
            $this->dispatch($campaign);

            return $campaign;
        });
    }

    public function finish(EmailCampaign $campaign): void
    {
        DB::transaction(function () use ($campaign) {
            $campaign = EmailCampaign::lockForUpdate()->findOrFail($campaign->id);
            if (! in_array($campaign->status, ['queued', 'sending'])) {
                return;
            }
            $counts = $campaign->recipients()->selectRaw('status, COUNT(*) as total')->groupBy('status')->pluck('total', 'status');
            if (($counts['queued'] ?? 0) + ($counts['sending'] ?? 0) > 0) {
                return;
            }
            $failures = ($counts['failed'] ?? 0) + ($counts['uncertain'] ?? 0);
            $campaign->update(['status' => $failures ? (($counts['sent'] ?? 0) ? 'partially_failed' : 'failed') : 'completed', 'completed_at' => now()]);
            $this->audit(null, 'campaign.'.$campaign->status, 'campaign', $campaign->id);
        });
    }
}
