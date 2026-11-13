<?php

namespace App\Services;

use App\Models\EmailSuppression;
use App\Models\MarketingContact;

class MarketingAudience
{
    public function query(string $group = 'users', array $ids = [])
    {
        $query = MarketingContact::query()->whereNotNull('consented_at')->whereNull('unsubscribed_at')
            ->whereNotIn('email', EmailSuppression::select('email'))
            ->where(function ($q) {
                $q->where(fn ($orphan) => $orphan->whereNull('user_id')->where('requires_user', false))->orWhereHas('user', fn ($u) => $u->where('is_blocked', false)->whereNotNull('email_verified_at')->whereRaw('LOWER(TRIM(users.email)) = marketing_contacts.email'));
            });
        if ($group === 'agents') {
            $query->whereHas('user', fn ($q) => $q->where('role', 'agent'));
        }
        if ($group === 'customers') {
            $query->whereHas('user', fn ($q) => $q->whereIn('role', ['buyer', 'seller']));
        }
        if ($group === 'users') {
            $query->whereNotNull('user_id');
        }
        if ($group === 'subscribers') {
            $query->where('source', 'newsletter');
        }
        if ($group === 'custom') {
            $query->whereIn('id', $ids);
        }

        return $query;
    }

    public function eligible(MarketingContact $contact, string $email): bool
    {
        return filter_var($email, FILTER_VALIDATE_EMAIL) && $contact->email === $email
            && $this->query('custom', [$contact->id])->exists();
    }
}
