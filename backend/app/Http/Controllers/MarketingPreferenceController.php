<?php

namespace App\Http\Controllers;

use App\Models\EmailSuppression;
use App\Models\MarketingContact;
use App\Services\BulkEmailService;
use App\Services\MarketingAudience;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class MarketingPreferenceController extends Controller
{
    public function show(Request $request)
    {
        $contact = MarketingContact::where('email', mb_strtolower(trim($request->user()->email ?? '')))->first();

        return response()->json(['opted_in' => $contact && app(MarketingAudience::class)->eligible($contact, $contact->email), 'suppressed' => $contact && EmailSuppression::where('email', $contact->email)->where('reason', '!=', 'unsubscribe')->exists()]);
    }

    public function update(Request $request, BulkEmailService $service)
    {
        $request->validate(['opted_in' => 'required|boolean']);
        $user = $request->user();
        abort_unless(! $user->is_blocked && $user->email_verified_at && filter_var($user->email, FILTER_VALIDATE_EMAIL), 422, 'A verified email address is required.');
        $email = mb_strtolower(trim($user->email));
        $contact = MarketingContact::firstOrCreate(['email' => $email], ['user_id' => $user->id, 'requires_user' => true, 'name' => $user->name, 'source' => 'self', 'consent_evidence' => 'Authenticated account preference', 'unsubscribe_token' => Str::random(64)]);
        if ($request->boolean('opted_in')) {
            $contact->update(['user_id' => $user->id, 'requires_user' => true, 'name' => $user->name, 'consented_at' => now(), 'unsubscribed_at' => null, 'consent_evidence' => 'Explicit opt-in through authenticated account preferences']);
            EmailSuppression::where('email', $email)->where('reason', 'unsubscribe')->delete();
        } else {
            $this->withdraw($contact);
        }
        $service->audit($user->id, $request->boolean('opted_in') ? 'contact.opted_in' : 'contact.opted_out', 'contact', $contact->id);

        return $this->show($request);
    }

    public function confirm(string $token)
    {
        MarketingContact::where('unsubscribe_token', $token)->firstOrFail();

        return response()->view('emails.unsubscribe', ['token' => $token, 'done' => false])->header('Cache-Control', 'no-store')->header('Referrer-Policy', 'no-referrer');
    }

    public function unsubscribe(string $token, BulkEmailService $service)
    {
        $contact = MarketingContact::where('unsubscribe_token', $token)->firstOrFail();
        $this->withdraw($contact);
        $service->audit(null, 'contact.unsubscribed', 'contact', $contact->id);

        return response()->view('emails.unsubscribe', ['token' => $token, 'done' => true])->header('Cache-Control', 'no-store')->header('Referrer-Policy', 'no-referrer');
    }

    private function withdraw(MarketingContact $contact): void
    {
        $contact->update(['unsubscribed_at' => now()]);
        EmailSuppression::firstOrCreate(['email' => $contact->email], ['reason' => 'unsubscribe']);
    }
}
