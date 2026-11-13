<?php

namespace App\Models;

use App\Services\AgentIdentity;
use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\ValidationException;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    /** @use HasFactory<UserFactory> */
    use HasApiTokens, HasFactory, Notifiable;

    protected $fillable = [
        'name',
        'email',
        'password',
        'phone',
        'role',
        'avatar',
        'is_blocked',
        'suburb',
        'district',
        'state',
        'postcode',
        'country',
        'bio',
        'facebook',
        'instagram',
        'linkedin',
        'whatsapp',
        'twitter',
        'website',
        'slug',
        'otp',
        'otp_expires_at',
        'email_verified_at',
    ];

    protected $hidden = [
        'password',
        'remember_token',
        'agent_email_key',
        'agent_phone_key',
        'otp',
        'otp_expires_at',
    ];

    protected static function booted(): void
    {
        static::saving(function (User $user) {
            if ($user->exists && ! $user->isDirty(['name', 'email', 'phone', 'role'])) {
                return;
            }
            if ($user->role === 'agent') {
                $user->name = preg_replace('/\s+/u', ' ', trim($user->name));
                $user->email = filled($user->email) ? mb_strtolower(trim($user->email)) : null;
                if ($user->email && static::where('id', '!=', $user->id ?? 0)->whereRaw('LOWER(TRIM(email)) = ?', [$user->email])->exists()) {
                    throw ValidationException::withMessages(['email' => ['This email already belongs to an existing account.']]);
                }
            }
            $keys = AgentIdentity::keys($user);
            if ($user->role === 'agent') {
                $duplicates = static::where('role', 'agent')->where('id', '!=', $user->id ?? 0)->get();
                foreach ($duplicates as $candidate) {
                    if (array_intersect(array_filter($keys), array_filter(AgentIdentity::keys($candidate)))) {
                        throw ValidationException::withMessages(['name' => ['An agent with this name and contact already exists. Select the existing account for additional listings.']]);
                    }
                }
            }
            foreach ($keys as $column => $key) {
                $user->{$column} = $user->role === 'agent' ? $key : null;
            }
        });
    }

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'is_blocked' => 'boolean',
        ];
    }

    public function getAvatarAttribute(?string $value): ?string
    {
        if (! $value) {
            return null;
        }
        if (preg_match('#^https?://#i', $value)) {
            return $value;
        }
        if (! Storage::disk('public')->exists($value)) {
            return null;
        }

        return Storage::disk('public')->url($value);
    }

    public function properties(): HasMany
    {
        return $this->hasMany(Property::class);
    }

    // Listings this user created on someone else's behalf
    // (admin / advertisement manager acting as an agent).
    public function createdListings(): HasMany
    {
        return $this->hasMany(Property::class, 'created_by_id');
    }

    public function inquiries(): HasMany
    {
        return $this->hasMany(Inquiry::class);
    }

    public function agentSlides(): HasMany
    {
        return $this->hasMany(AgentSlide::class);
    }
}
