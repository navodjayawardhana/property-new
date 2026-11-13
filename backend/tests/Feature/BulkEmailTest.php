<?php

namespace Tests\Feature;

use App\Jobs\ProcessEmailCampaign;
use App\Jobs\SendCampaignTest;
use App\Mail\CampaignEmail;
use App\Models\EmailAuditLog;
use App\Models\EmailCampaign;
use App\Models\EmailSuppression;
use App\Models\MarketingContact;
use App\Models\User;
use App\Services\BulkEmailService;
use App\Services\EmailContent;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Queue;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Str;
use Laravel\Sanctum\Sanctum;
use Symfony\Component\Mailer\Exception\TransportException;
use Tests\TestCase;

class BulkEmailTest extends TestCase
{
    use RefreshDatabase;

    protected function migrateFreshUsing(): array
    {
        // The legacy MySQL ENUM widening migration cannot run on SQLite.
        return ['--path' => array_values(array_map(fn ($path) => str_replace(base_path().DIRECTORY_SEPARATOR, '', $path), array_filter(glob(database_path('migrations/*.php')), fn ($path) => ! str_contains($path, 'add_advertisement_manager_role'))))];
    }

    protected function setUp(): void
    {
        parent::setUp();
        Mail::fake();
        Queue::fake();
        Cache::flush();
        config(['bulk_email.connection' => 'database', 'bulk_email.per_minute' => 1000, 'bulk_email.batch_size' => 20]);
    }

    private function admin(): User
    {
        $user = User::factory()->create(['role' => 'admin']);
        Sanctum::actingAs($user);

        return $user;
    }

    private function contact(array $attributes = []): MarketingContact
    {
        return MarketingContact::create(array_merge(['name' => 'Consented Person', 'email' => Str::random(10).'@example.com', 'source' => 'newsletter', 'consent_evidence' => 'Newsletter form opt-in dated today', 'consented_at' => now(), 'unsubscribe_token' => Str::random(64)], $attributes));
    }

    private function draft(array $attributes = []): EmailCampaign
    {
        return EmailCampaign::create(array_merge(['name' => 'Property news', 'subject' => 'New properties', 'body' => '<p>Hello {{recipient_name}}</p>', 'recipient_group' => 'subscribers', 'submission_key' => Str::uuid()->toString()], $attributes));
    }

    private function process(EmailCampaign $campaign): void
    {
        $this->app->call([new ProcessEmailCampaign($campaign->id), 'handle']);
    }

    public function test_admin_endpoints_reject_guests_non_admins_and_blocked_admins(): void
    {
        $this->getJson('/api/admin/bulk-email/contacts')->assertUnauthorized();
        Sanctum::actingAs(User::factory()->create(['role' => 'buyer']));
        $this->getJson('/api/admin/bulk-email/contacts')->assertForbidden();
        Sanctum::actingAs(User::factory()->create(['role' => 'admin', 'is_blocked' => true]));
        $this->getJson('/api/admin/bulk-email/campaigns')->assertForbidden();
    }

    public function test_drafts_are_sanitized_editable_and_submission_keys_are_idempotent(): void
    {
        $this->admin();
        $payload = ['submission_key' => Str::uuid()->toString(), 'name' => 'Campaign', 'subject' => 'Subject', 'body' => '<p onclick="evil()">Hello</p><script>evil()</script>', 'recipient_group' => 'users'];
        $result = $this->postJson('/api/admin/bulk-email/campaigns', $payload)->assertCreated()->assertJsonPath('status', 'draft');
        $this->assertSame('<p>Hello</p>', $result->json('body'));
        $this->postJson('/api/admin/bulk-email/campaigns', $payload)->assertOk();
        $this->assertDatabaseCount('email_campaigns', 1);
        $this->putJson('/api/admin/bulk-email/campaigns/'.$result->json('id'), array_merge($payload, ['subject' => 'Changed']))->assertOk()->assertJsonPath('subject', 'Changed');
        Mail::assertNothingSent();
        Queue::assertNothingPushed();
    }

    public function test_registered_users_are_not_enrolled_without_consent(): void
    {
        $this->admin();
        User::factory()->count(3)->create();
        $this->postJson('/api/admin/bulk-email/audience', ['recipient_group' => 'users'])->assertOk()->assertJsonPath('count', 0);
        $this->getJson('/api/admin/bulk-email/contacts?eligible=1')->assertJsonPath('total', 0);
    }

    public function test_consent_can_only_be_recorded_with_evidence_and_contacts_are_normalized_unique(): void
    {
        $this->admin();
        $payload = ['name' => 'Person', 'email' => ' PERSON@Example.com ', 'source' => 'newsletter', 'consent_evidence' => 'Newsletter explicit opt-in 2026-11-13', 'consent_confirmed' => true];
        $this->postJson('/api/admin/bulk-email/contacts', array_merge($payload, ['consent_confirmed' => false]))->assertUnprocessable();
        $this->postJson('/api/admin/bulk-email/contacts', $payload)->assertCreated()->assertJsonPath('email', 'person@example.com')->assertJsonMissingPath('unsubscribe_token');
        $this->postJson('/api/admin/bulk-email/contacts', $payload)->assertUnprocessable();
        $this->assertDatabaseCount('marketing_contacts', 1);
    }

    public function test_groups_search_pagination_and_eligibility_filters(): void
    {
        $this->admin();
        $agent = User::factory()->create(['role' => 'agent']);
        $buyer = User::factory()->create(['role' => 'buyer']);
        $this->contact(['user_id' => $agent->id, 'requires_user' => true, 'name' => 'Find Agent', 'email' => strtolower($agent->email)]);
        $this->contact(['user_id' => $buyer->id, 'requires_user' => true, 'email' => strtolower($buyer->email)]);
        $this->contact(['consented_at' => null]);
        $this->contact(['unsubscribed_at' => now()]);
        $suppressed = $this->contact();
        EmailSuppression::create(['email' => $suppressed->email, 'reason' => 'Provider complaint']);
        $this->postJson('/api/admin/bulk-email/audience', ['recipient_group' => 'agents'])->assertJsonPath('count', 1);
        $this->postJson('/api/admin/bulk-email/audience', ['recipient_group' => 'customers'])->assertJsonPath('count', 1);
        $this->getJson('/api/admin/bulk-email/contacts?eligible=1&group=agents&search=Find')->assertJsonPath('total', 1);
        for ($i = 0; $i < 21; $i++) {
            $this->contact();
        }
        $this->getJson('/api/admin/bulk-email/contacts?page=2')->assertJsonPath('current_page', 2)->assertJsonCount(6, 'data');
        $buyer->update(['is_blocked' => true]);
        $this->postJson('/api/admin/bulk-email/audience', ['recipient_group' => 'customers'])->assertJsonPath('count', 0);
    }

    public function test_sending_requires_confirmation_snapshots_once_and_queues_without_sending_http_mail(): void
    {
        $this->admin();
        $this->contact();
        $this->contact();
        $campaign = $this->draft();
        $url = '/api/admin/bulk-email/campaigns/'.$campaign->id.'/send';
        $this->postJson($url, [])->assertUnprocessable();
        $this->postJson($url, ['confirmed' => true])->assertOk()->assertJsonPath('status', 'queued');
        $this->postJson($url, ['confirmed' => true])->assertOk();
        $this->assertDatabaseCount('campaign_recipients', 2);
        Queue::assertPushed(ProcessEmailCampaign::class, 1);
        Mail::assertNothingSent();
        $this->getJson('/api/admin/bulk-email/campaigns/'.$campaign->id)->assertJsonPath('campaign.queued_count', 2)->assertJsonPath('eligible_count', 2);
    }

    public function test_sync_queue_configuration_is_rejected_and_snapshot_rolls_back(): void
    {
        $this->admin();
        $this->contact();
        $campaign = $this->draft();
        config(['bulk_email.connection' => 'sync']);
        $this->postJson('/api/admin/bulk-email/campaigns/'.$campaign->id.'/send', ['confirmed' => true])->assertUnprocessable();
        $this->assertSame('draft', $campaign->fresh()->status);
        $this->assertDatabaseCount('campaign_recipients', 0);
        Mail::assertNothingSent();
    }

    public function test_job_renders_safe_placeholders_sends_separately_and_is_idempotent(): void
    {
        $contact = $this->contact(['name' => '<img src=x onerror=evil()>']);
        $campaign = $this->draft();
        app(BulkEmailService::class)->start($campaign, $this->admin()->id);
        $this->process($campaign);
        $this->process($campaign);
        Mail::assertSent(CampaignEmail::class, 1);
        Mail::assertSent(CampaignEmail::class, fn ($mail) => $mail->hasTo($contact->email) && str_contains($mail->safeBody, '&lt;img') && str_contains($mail->unsubscribeUrl, $contact->getRawOriginal('unsubscribe_token')));
        $this->assertSame('completed', $campaign->fresh()->status);
        $this->assertDatabaseCount('email_send_attempts', 1);
        $this->assertDatabaseHas('campaign_recipients', ['campaign_id' => $campaign->id, 'status' => 'sent']);
    }

    public function test_consent_suppression_and_email_changes_are_checked_after_queueing(): void
    {
        $admin = $this->admin();
        $one = $this->contact();
        $two = $this->contact();
        $three = $this->contact();
        $campaign = $this->draft();
        app(BulkEmailService::class)->start($campaign, $admin->id);
        $one->update(['unsubscribed_at' => now()]);
        EmailSuppression::create(['email' => $two->email, 'reason' => 'Suppressed']);
        $three->update(['email' => 'changed@example.com']);
        $this->process($campaign);
        Mail::assertNothingSent();
        $this->assertSame(3, $campaign->recipients()->where('status', 'skipped')->count());
    }

    public function test_pause_resume_and_cancel_control_pending_work(): void
    {
        $admin = $this->admin();
        $this->contact();
        $campaign = $this->draft();
        app(BulkEmailService::class)->start($campaign, $admin->id);
        $url = '/api/admin/bulk-email/campaigns/'.$campaign->id;
        $this->postJson($url.'/pause')->assertOk()->assertJsonPath('status', 'paused');
        $this->process($campaign);
        Mail::assertNothingSent();
        $this->postJson($url.'/resume')->assertOk()->assertJsonPath('status', 'queued');
        $this->postJson($url.'/cancel')->assertOk()->assertJsonPath('status', 'cancelled');
        $this->process($campaign);
        Mail::assertNothingSent();
        $this->assertSame(1, $campaign->recipients()->where('status', 'cancelled')->count());
    }

    public function test_batch_size_and_global_rate_limit(): void
    {
        $admin = $this->admin();
        for ($i = 0; $i < 3; $i++) {
            $this->contact();
        }
        $campaign = $this->draft();
        app(BulkEmailService::class)->start($campaign, $admin->id);
        config(['bulk_email.batch_size' => 1, 'bulk_email.per_minute' => 1]);
        $this->process($campaign);
        $this->process($campaign);
        Mail::assertSent(CampaignEmail::class, 1);
        $this->assertSame(2, $campaign->recipients()->where('status', 'queued')->count());
        RateLimiter::clear('bulk-email:global');
        $this->process($campaign);
        Mail::assertSent(CampaignEmail::class, 2);
    }

    public function test_explicit_temporary_smtp_rejections_retry_with_a_bound(): void
    {
        $admin = $this->admin();
        $contact = $this->contact();
        $campaign = $this->draft();
        app(BulkEmailService::class)->start($campaign, $admin->id);
        config(['bulk_email.max_attempts' => 2, 'bulk_email.retry_delay' => 1]);
        Mail::shouldReceive('to')->with($contact->email)->andReturnSelf();
        Mail::shouldReceive('send')->twice()->andThrow(new TransportException('Temporary rejection', 451));
        $this->process($campaign);
        $this->assertDatabaseHas('campaign_recipients', ['status' => 'queued', 'attempts' => 1]);
        $this->travel(2)->seconds();
        $this->process($campaign);
        $this->assertDatabaseHas('campaign_recipients', ['status' => 'failed', 'attempts' => 2]);
        $this->assertSame('failed', $campaign->fresh()->status);
    }

    public function test_uncertain_transport_failure_is_not_retried_or_logged_with_an_address(): void
    {
        $admin = $this->admin();
        $contact = $this->contact();
        $campaign = $this->draft();
        app(BulkEmailService::class)->start($campaign, $admin->id);
        Mail::shouldReceive('to')->with($contact->email)->andReturnSelf();
        Mail::shouldReceive('send')->once()->andThrow(new TransportException('Timeout for '.$contact->email));
        $this->process($campaign);
        $this->process($campaign);
        $recipient = $campaign->recipients()->first();
        $this->assertSame('uncertain', $recipient->status);
        $this->assertStringNotContainsString($contact->email, $recipient->error);
    }

    public function test_interrupted_claim_is_marked_uncertain_without_resending(): void
    {
        $admin = $this->admin();
        $this->contact();
        $campaign = $this->draft();
        app(BulkEmailService::class)->start($campaign, $admin->id);
        $campaign->recipients()->update(['status' => 'sending', 'claimed_at' => now()->subMinutes(11)]);
        $this->artisan('bulk-email:recover')->assertSuccessful();
        $this->process($campaign);
        Mail::assertNothingSent();
        $this->assertDatabaseHas('campaign_recipients', ['status' => 'uncertain']);
    }

    public function test_unsubscribe_requires_post_is_repeatable_and_blocks_pending_send(): void
    {
        $contact = $this->contact();
        $campaign = $this->draft();
        app(BulkEmailService::class)->start($campaign, $this->admin()->id);
        $url = '/email/unsubscribe/'.$contact->getRawOriginal('unsubscribe_token');
        $this->get($url)->assertOk();
        $this->assertNull($contact->fresh()->unsubscribed_at);
        $this->post($url)->assertOk()->assertSee('You have been unsubscribed');
        $this->post($url)->assertOk();
        $this->process($campaign);
        Mail::assertNothingSent();
        $this->assertDatabaseHas('email_suppressions', ['email' => $contact->email, 'reason' => 'unsubscribe']);
        $this->get('/email/unsubscribe/not-a-token')->assertNotFound();
    }

    public function test_self_preferences_record_real_consent_and_do_not_override_admin_suppressions(): void
    {
        $user = User::factory()->create();
        Sanctum::actingAs($user);
        $this->getJson('/api/marketing-preferences')->assertJsonPath('opted_in', false);
        $this->putJson('/api/marketing-preferences', ['opted_in' => true])->assertOk()->assertJsonPath('opted_in', true);
        $this->putJson('/api/marketing-preferences', ['opted_in' => false])->assertOk()->assertJsonPath('opted_in', false);
        $this->putJson('/api/marketing-preferences', ['opted_in' => true])->assertJsonPath('opted_in', true);
        EmailSuppression::create(['email' => strtolower($user->email), 'reason' => 'Provider complaint']);
        $this->putJson('/api/marketing-preferences', ['opted_in' => true])->assertJsonPath('opted_in', false)->assertJsonPath('suppressed', true);
    }

    public function test_template_crud_and_safe_preview(): void
    {
        $this->admin();
        $payload = ['name' => 'Template', 'subject' => 'News', 'body' => '<p>{{recipient_name}}</p><a href="javascript:evil()">Link</a><img src=x onerror=evil()>'];
        $result = $this->postJson('/api/admin/bulk-email/templates', $payload)->assertOk();
        $id = $result->json('id');
        $this->assertStringNotContainsString('javascript:', $result->json('body'));
        $this->assertStringNotContainsString('<img', $result->json('body'));
        $this->putJson('/api/admin/bulk-email/templates/'.$id, array_merge($payload, ['name' => 'Updated']))->assertOk()->assertJsonPath('name', 'Updated');
        $this->postJson('/api/admin/bulk-email/preview', ['body' => $payload['body']])->assertOk()->assertJsonPath('html', '<p>Preview recipient</p><a>Link</a>');
        $campaign = $this->draft(['template_id' => $id]);
        $this->deleteJson('/api/admin/bulk-email/templates/'.$id)->assertOk();
        $this->assertNull($campaign->fresh()->template_id);
        $this->assertSame('<p>Hello {{recipient_name}}</p>', $campaign->fresh()->body);
    }

    public function test_test_email_is_queued_and_only_targets_the_admin(): void
    {
        $admin = $this->admin();
        $this->contact();
        $campaign = $this->draft();
        $this->postJson('/api/admin/bulk-email/campaigns/'.$campaign->id.'/test')->assertOk();
        Mail::assertNothingSent();
        Queue::assertPushed(SendCampaignTest::class, fn ($job) => $job->adminId === $admin->id);
        $requestId = EmailAuditLog::where('action', 'campaign.test_queued')->value('id');
        $job = new SendCampaignTest($campaign->id, $admin->id, $requestId);
        $this->app->call([$job, 'handle']);
        $this->app->call([$job, 'handle']);
        Mail::assertSent(CampaignEmail::class, 1);
        Mail::assertSent(CampaignEmail::class, fn ($mail) => $mail->hasTo($admin->email) && $mail->test);
        $this->assertDatabaseHas('email_audit_logs', ['action' => 'campaign.test_accepted']);
    }

    public function test_custom_selection_excludes_unconsented_addresses_and_stats_are_real(): void
    {
        $admin = $this->admin();
        $contact = $this->contact();
        $other = $this->contact(['consented_at' => null]);
        $campaign = $this->draft(['recipient_group' => 'custom', 'contact_ids' => [$contact->id, $other->id, $contact->id]]);
        app(BulkEmailService::class)->start($campaign, $admin->id);
        $this->process($campaign);
        $this->assertDatabaseCount('campaign_recipients', 1);
        $this->getJson('/api/admin/bulk-email/stats')->assertJsonPath('campaigns', 1)->assertJsonPath('recipients', 1)->assertJsonPath('sent', 1)->assertJsonPath('failed', 0);
        $this->assertStringNotContainsString($contact->email, EmailAuditLog::all()->toJson());
    }

    public function test_deleted_or_unverified_linked_accounts_are_ineligible(): void
    {
        $this->admin();
        $user = User::factory()->unverified()->create();
        $contact = $this->contact(['user_id' => $user->id, 'requires_user' => true, 'email' => strtolower($user->email)]);
        $this->postJson('/api/admin/bulk-email/audience', ['recipient_group' => 'custom', 'contact_ids' => [$contact->id]])->assertJsonPath('count', 0);
        $user->delete();
        $this->postJson('/api/admin/bulk-email/audience', ['recipient_group' => 'custom', 'contact_ids' => [$contact->id]])->assertJsonPath('count', 0);
    }

    public function test_database_queue_serialization_and_worker_middleware_with_fake_mail(): void
    {
        $admin = $this->admin();
        $this->contact();
        $campaign = $this->draft();
        app(BulkEmailService::class)->start($campaign, $admin->id);
        Queue::swap(Queue::getFacadeRoot()->queue);
        Queue::connection('database')->push((new ProcessEmailCampaign($campaign->id))->beforeCommit(), '', 'bulk-email');
        $this->assertDatabaseCount('jobs', 1);
        $this->artisan('queue:work', ['connection' => 'database', '--queue' => 'bulk-email', '--once' => true, '--sleep' => 0])->assertSuccessful();
        Mail::assertSent(CampaignEmail::class, 1);
        $this->assertDatabaseCount('jobs', 0);
        $this->assertSame('completed', $campaign->fresh()->status);
    }

    public function test_partial_failure_and_permanent_rejection_are_recorded(): void
    {
        $admin = $this->admin();
        $this->contact();
        $this->contact();
        $campaign = $this->draft();
        app(BulkEmailService::class)->start($campaign, $admin->id);
        $calls = 0;
        Mail::shouldReceive('to')->andReturnSelf();
        Mail::shouldReceive('send')->twice()->andReturnUsing(function () use (&$calls) {
            if (++$calls === 2) {
                throw new TransportException('Permanent SMTP rejection', 550);
            }

            return null;
        });
        $this->process($campaign);
        $this->assertSame('partially_failed', $campaign->fresh()->status);
        $this->assertSame(1, $campaign->recipients()->where('status', 'sent')->count());
        $this->assertSame(1, $campaign->recipients()->where('status', 'failed')->count());
    }

    public function test_active_campaign_cannot_be_edited_and_header_injection_is_rejected(): void
    {
        $admin = $this->admin();
        $this->contact();
        $campaign = $this->draft();
        $payload = ['name' => 'Updated', 'subject' => "Subject\r\nBcc: evil@example.com", 'body' => '<p>News</p>', 'recipient_group' => 'users'];
        $this->putJson('/api/admin/bulk-email/campaigns/'.$campaign->id, $payload)->assertUnprocessable();
        app(BulkEmailService::class)->start($campaign, $admin->id);
        $payload['subject'] = 'A valid subject';
        $this->putJson('/api/admin/bulk-email/campaigns/'.$campaign->id, $payload)->assertConflict();
    }

    public function test_suppression_management_normalizes_addresses_without_clearing_opt_out(): void
    {
        $this->admin();
        $contact = $this->contact(['email' => 'person@example.com', 'unsubscribed_at' => now()]);
        $this->postJson('/api/admin/bulk-email/suppressions', ['email' => 'invalid', 'reason' => 'Complaint'])->assertUnprocessable();
        $result = $this->postJson('/api/admin/bulk-email/suppressions', ['email' => ' PERSON@Example.com ', 'reason' => 'Complaint'])->assertOk()->assertJsonPath('email', 'person@example.com');
        $this->getJson('/api/admin/bulk-email/suppressions')->assertJsonPath('total', 1);
        $this->deleteJson('/api/admin/bulk-email/suppressions/'.$result->json('id'))->assertOk();
        $this->postJson('/api/admin/bulk-email/audience', ['recipient_group' => 'custom', 'contact_ids' => [$contact->id]])->assertJsonPath('count', 0);
    }

    public function test_unverified_users_cannot_opt_in_and_rich_editor_paragraphs_are_preserved(): void
    {
        Sanctum::actingAs(User::factory()->unverified()->create());
        $this->putJson('/api/marketing-preferences', ['opted_in' => true])->assertUnprocessable();
        $html = app(EmailContent::class)->sanitize('First line<div>Second line</div><div><br></div>');
        $this->assertStringContainsString('<p>Second line</p>', $html);
        $this->assertDatabaseCount('marketing_contacts', 0);
    }
}
