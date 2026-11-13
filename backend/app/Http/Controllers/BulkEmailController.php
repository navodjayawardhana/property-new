<?php

namespace App\Http\Controllers;

use App\Jobs\SendCampaignTest;
use App\Models\CampaignRecipient;
use App\Models\EmailAuditLog;
use App\Models\EmailCampaign;
use App\Models\EmailSuppression;
use App\Models\EmailTemplate;
use App\Models\MarketingContact;
use App\Models\User;
use App\Services\BulkEmailService;
use App\Services\EmailContent;
use App\Services\MarketingAudience;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class BulkEmailController extends Controller
{
    public function stats()
    {
        return response()->json(['campaigns' => EmailCampaign::count(), 'recipients' => CampaignRecipient::count(), 'sent' => CampaignRecipient::where('status', 'sent')->count(), 'failed' => CampaignRecipient::whereIn('status', ['failed', 'uncertain'])->count(), 'queued' => CampaignRecipient::whereIn('status', ['queued', 'sending'])->count(), 'eligible_contacts' => app(MarketingAudience::class)->query('all')->count()]);
    }

    private function withCounts($query)
    {
        return $query->withCount(['recipients', 'recipients as queued_count' => fn ($q) => $q->whereIn('status', ['queued', 'sending']), 'recipients as sent_count' => fn ($q) => $q->where('status', 'sent'), 'recipients as failed_count' => fn ($q) => $q->whereIn('status', ['failed', 'uncertain']), 'recipients as skipped_count' => fn ($q) => $q->whereIn('status', ['skipped', 'cancelled'])]);
    }

    public function index(Request $request)
    {
        $query = $this->withCounts(EmailCampaign::query())->latest('id');
        if ($request->filled('status')) {
            $query->where('status', $request->input('status'));
        }
        if ($request->filled('search')) {
            $query->where('name', 'like', '%'.substr($request->input('search'), 0, 100).'%');
        }

        return response()->json($query->paginate(15));
    }

    private function campaignData(Request $request): array
    {
        $data = $request->validate(['name' => 'required|string|max:255', 'subject' => ['required', 'string', 'max:255', 'not_regex:/[\r\n]/'], 'body' => 'required|string|max:100000', 'recipient_group' => 'required|in:users,customers,agents,subscribers,custom', 'contact_ids' => 'nullable|array|max:5000', 'contact_ids.*' => 'integer|distinct|exists:marketing_contacts,id', 'template_id' => 'nullable|exists:email_templates,id']);
        $data['body'] = app(EmailContent::class)->sanitize($data['body']);
        if (! trim(strip_tags($data['body']))) {
            throw ValidationException::withMessages(['body' => ['Enter email content.']]);
        }
        if ($data['recipient_group'] === 'custom' && empty($data['contact_ids'])) {
            throw ValidationException::withMessages(['contact_ids' => ['Select at least one eligible contact.']]);
        }

        return $data;
    }

    public function store(Request $request, BulkEmailService $service)
    {
        $request->validate(['submission_key' => 'required|uuid']);
        $data = $this->campaignData($request);
        $campaign = DB::transaction(function () use ($request, $data, $service) {
            $campaign = EmailCampaign::firstOrCreate(['submission_key' => $request->submission_key], $data + ['created_by' => $request->user()->id]);
            if ($campaign->wasRecentlyCreated) {
                $service->audit($request->user()->id, 'campaign.created', 'campaign', $campaign->id);
            }

            return $campaign;
        });

        return response()->json($campaign, $campaign->wasRecentlyCreated ? 201 : 200);
    }

    public function update(Request $request, EmailCampaign $campaign, BulkEmailService $service)
    {
        $data = $this->campaignData($request);
        DB::transaction(function () use ($campaign, $data, $request, $service) {
            $campaign = EmailCampaign::lockForUpdate()->findOrFail($campaign->id);
            abort_unless($campaign->status === 'draft', 409, 'Only drafts can be edited.');
            $campaign->update($data);
            $service->audit($request->user()->id, 'campaign.updated', 'campaign', $campaign->id);
        });

        return response()->json($campaign->fresh());
    }

    public function show(Request $request, EmailCampaign $campaign)
    {
        $recipients = $campaign->recipients()->with('sendAttempts')->orderBy('id');
        if ($request->filled('recipient_status')) {
            $recipients->where('status', $request->recipient_status);
        }

        return response()->json(['campaign' => $this->withCounts(EmailCampaign::whereKey($campaign->id))->first(), 'eligible_count' => app(MarketingAudience::class)->query($campaign->recipient_group, $campaign->contact_ids ?? [])->count(), 'recipients' => $recipients->paginate(20), 'activity' => EmailAuditLog::where('entity_type', 'campaign')->where('entity_id', $campaign->id)->latest('id')->limit(30)->get()]);
    }

    public function audience(Request $request, MarketingAudience $audience)
    {
        $data = $request->validate(['recipient_group' => 'required|in:users,customers,agents,subscribers,custom', 'contact_ids' => 'nullable|array|max:5000', 'contact_ids.*' => 'integer']);

        return response()->json(['count' => $audience->query($data['recipient_group'], $data['contact_ids'] ?? [])->count()]);
    }

    public function action(Request $request, EmailCampaign $campaign, string $action, BulkEmailService $service)
    {
        abort_unless(in_array($action, ['send', 'test', 'pause', 'resume', 'cancel']), 404);
        if ($action === 'send') {
            $request->validate(['confirmed' => 'required|accepted']);

            return response()->json($service->start($campaign, $request->user()->id));
        }
        if ($action === 'test') {
            $user = $request->user();
            abort_unless($user->email_verified_at && filter_var($user->email, FILTER_VALIDATE_EMAIL), 422, 'Verify your administrator email before sending a test.');
            // Validate async connection exactly as for real campaigns.
            $connection = config('bulk_email.connection');
            abort_unless(in_array(config("queue.connections.$connection.driver"), ['database', 'redis', 'sqs', 'beanstalkd']), 422, 'An asynchronous queue is required.');
            DB::transaction(function () use ($campaign, $user, $service, $connection) {
                $entry = $service->audit($user->id, 'campaign.test_queued', 'campaign', $campaign->id);
                $entry->update(['state' => 'queued']);
                SendCampaignTest::dispatch($campaign->id, $user->id, $entry->id)->onConnection($connection)->onQueue(config('bulk_email.queue'))->afterCommit();
            });

            return response()->json(['message' => 'Test queued to your verified administrator email.']);
        }
        DB::transaction(function () use ($campaign, $action, $request, $service) {
            $campaign = EmailCampaign::lockForUpdate()->findOrFail($campaign->id);
            $allowed = ['pause' => ['queued', 'sending'], 'resume' => ['paused'], 'cancel' => ['draft', 'queued', 'sending', 'paused']];
            abort_unless(in_array($campaign->status, $allowed[$action]), 409, 'This action is not available in the current campaign state.');
            $campaign->update(['status' => ['pause' => 'paused', 'resume' => 'queued', 'cancel' => 'cancelled'][$action], 'completed_at' => $action === 'cancel' ? now() : null]);
            if ($action === 'cancel') {
                $campaign->recipients()->where('status', 'queued')->update(['status' => 'cancelled', 'updated_at' => now()]);
            }
            $service->audit($request->user()->id, 'campaign.'.$action, 'campaign', $campaign->id);
            if ($action === 'resume') {
                $service->dispatch($campaign);
            }
        });

        return response()->json($campaign->fresh());
    }

    public function preview(Request $request, EmailContent $content)
    {
        $request->validate(['body' => 'required|string|max:100000']);

        return response()->json(['html' => $content->render($request->body, 'Preview recipient')]);
    }

    public function templates()
    {
        return response()->json(EmailTemplate::latest('id')->paginate(30));
    }

    public function saveTemplate(Request $request, BulkEmailService $service, ?EmailTemplate $template = null)
    {
        $data = $request->validate(['name' => 'required|string|max:255', 'subject' => ['required', 'string', 'max:255', 'not_regex:/[\r\n]/'], 'body' => 'required|string|max:100000']);
        $data['body'] = app(EmailContent::class)->sanitize($data['body']);
        $template ? $template->update($data) : $template = EmailTemplate::create($data);
        $service->audit($request->user()->id, 'template.saved', 'template', $template->id);

        return response()->json($template);
    }

    public function deleteTemplate(Request $request, EmailTemplate $template, BulkEmailService $service)
    {
        $service->audit($request->user()->id, 'template.deleted', 'template', $template->id);
        $template->delete();

        return response()->json(['message' => 'Template deleted. Campaign snapshots are preserved.']);
    }

    public function contacts(Request $request, MarketingAudience $audience)
    {
        $data = $request->validate(['group' => 'nullable|in:users,customers,agents,subscribers,all', 'search' => 'nullable|string|max:100', 'eligible' => 'nullable|boolean']);
        $query = $request->boolean('eligible') ? $audience->query($data['group'] ?? 'all') : MarketingContact::query();
        if ($request->filled('search')) {
            $query->where(fn ($q) => $q->where('name', 'like', '%'.$data['search'].'%')->orWhere('email', 'like', '%'.$data['search'].'%'));
        }

        return response()->json($query->select(['id', 'user_id', 'name', 'email', 'source', 'consented_at', 'unsubscribed_at'])->orderBy('name')->paginate(20));
    }

    public function storeContact(Request $request, BulkEmailService $service)
    {
        $request->merge(['email' => mb_strtolower(trim($request->input('email', '')))]);
        $data = $request->validate(['name' => 'required|string|max:255', 'email' => 'required|email|max:255|unique:marketing_contacts,email', 'source' => 'required|in:recorded,newsletter', 'consent_evidence' => 'required|string|min:10|max:2000', 'consent_confirmed' => 'required|accepted']);
        unset($data['consent_confirmed']);
        $data['user_id'] = User::whereRaw('LOWER(TRIM(email)) = ?', [$data['email']])->value('id');
        $data['requires_user'] = $data['user_id'] !== null;
        $contact = MarketingContact::create($data + ['consented_at' => now(), 'unsubscribe_token' => Str::random(64)]);
        $service->audit($request->user()->id, 'contact.consent_recorded', 'contact', $contact->id);

        return response()->json($contact, 201);
    }

    public function suppressions()
    {
        return response()->json(EmailSuppression::latest('id')->paginate(20));
    }

    public function suppress(Request $request, BulkEmailService $service)
    {
        $request->merge(['email' => mb_strtolower(trim($request->input('email', '')))]);
        $data = $request->validate(['email' => 'required|email|max:255', 'reason' => 'required|string|max:255']);
        $entry = EmailSuppression::updateOrCreate(['email' => $data['email']], ['reason' => $data['reason']]);
        $service->audit($request->user()->id, 'suppression.added', 'suppression', $entry->id);

        return response()->json($entry);
    }

    public function unsuppress(Request $request, EmailSuppression $suppression, BulkEmailService $service)
    {
        $service->audit($request->user()->id, 'suppression.removed', 'suppression', $suppression->id);
        $suppression->delete();

        return response()->json(['message' => 'Suppression removed. Consent and opt-out checks still apply.']);
    }
}
