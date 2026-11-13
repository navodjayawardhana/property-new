<?php

namespace App\Services;

use App\Models\User;
use Illuminate\Support\Collection;

class AgentIdentity
{
    public static function name(?string $name): string
    {
        return mb_strtolower(preg_replace('/\s+/u', ' ', trim($name ?? '')));
    }

    public static function keys(User $user): array
    {
        $name = self::name($user->name);
        $email = mb_strtolower(trim($user->email ?? ''));
        $phone = preg_replace('/\D/', '', $user->phone ?? '');
        if (strlen($phone) === 10 && str_starts_with($phone, '0')) {
            $phone = '94'.substr($phone, 1);
        } elseif (str_starts_with($phone, '00')) {
            $phone = substr($phone, 2);
        }

        return [
            'agent_email_key' => $email ? hash('sha256', $name.'|'.$email) : null,
            'agent_phone_key' => $phone ? hash('sha256', $name.'|'.$phone) : null,
        ];
    }

    // Contact evidence is required; names alone never establish identity.
    public static function groups(Collection $agents): Collection
    {
        $parents = [];
        $owners = [];
        $root = function ($id) use (&$parents, &$root) {
            if ($parents[$id] !== $id) {
                $parents[$id] = $root($parents[$id]);
            }

            return $parents[$id];
        };
        foreach ($agents->sortBy('id') as $agent) {
            $parents[$agent->id] = $agent->id;
            foreach (array_filter(self::keys($agent)) as $key) {
                if (isset($owners[$key])) {
                    $left = $root($agent->id);
                    $right = $root($owners[$key]);
                    $parents[max($left, $right)] = min($left, $right);
                }
                $owners[$key] = $agent->id;
            }
        }

        return $agents->sortBy('id')->groupBy(fn ($agent) => $root($agent->id))->values();
    }

    public static function profile(Collection $group): array
    {
        $primary = $group->first();
        $data = $primary->only(['id', 'name', 'email', 'phone', 'avatar', 'slug', 'suburb', 'district', 'state', 'postcode', 'country', 'bio', 'facebook', 'instagram', 'linkedin', 'whatsapp', 'twitter', 'website']);
        foreach (['avatar', 'bio', 'email', 'phone', 'facebook', 'instagram', 'linkedin', 'whatsapp', 'twitter', 'website'] as $field) {
            $data[$field] = $group->pluck($field)->first(fn ($value) => filled($value));
        }
        $data['user_ids'] = $group->pluck('id')->values();
        $data['locations'] = $group->map(fn ($agent) => $agent->only(['suburb', 'district', 'state', 'postcode', 'country']))->unique(fn ($location) => json_encode($location))->values();
        $data['properties_count'] = $group->sum('properties_count');

        return $data;
    }
}
