<?php

namespace App\Console\Commands;

use App\Models\CampaignRecipient;
use App\Models\EmailAuditLog;
use App\Models\EmailCampaign;
use App\Models\EmailSendAttempt;
use App\Services\BulkEmailService;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

class RecoverEmailCampaigns extends Command
{
    protected $signature = 'bulk-email:recover';

    protected $description = 'Reconcile abandoned claims without resending uncertain mail and wake active campaigns';

    public function handle(BulkEmailService $service): int
    {
        EmailAuditLog::where('action', 'campaign.test_queued')->where('state', 'sending')->where('updated_at', '<', now()->subMinutes(10))->update(['state' => 'uncertain', 'updated_at' => now()]);
        CampaignRecipient::where('status', 'sending')->where('claimed_at', '<', now()->subMinutes(10))->eachById(function ($recipient) {
            DB::transaction(function () use ($recipient) {
                $changed = CampaignRecipient::whereKey($recipient->id)->where('status', 'sending')->where('claimed_at', '<', now()->subMinutes(10))->update(['status' => 'uncertain', 'error' => 'Worker interrupted; acceptance unknown. Automatic resend disabled.', 'updated_at' => now()]);
                if ($changed) {
                    EmailSendAttempt::where('recipient_id', $recipient->id)->where('status', 'sending')->update(['status' => 'uncertain', 'error' => 'Worker interrupted; acceptance unknown.', 'updated_at' => now()]);
                }
            });
        });
        EmailCampaign::whereIn('status', ['queued', 'sending'])->eachById(function ($campaign) use ($service) {
            $service->finish($campaign);
            if ($campaign->recipients()->where('status', 'queued')->exists()) {
                $service->dispatch($campaign);
            }
        });
        $this->info('Active campaigns reconciled. No email sent by this command.');

        return self::SUCCESS;
    }
}
