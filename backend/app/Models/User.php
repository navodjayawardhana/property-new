<?php

namespace App\Models;

use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Support\Facades\Storage;
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
        'otp',
        'otp_expires_at',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password'          => 'hashed',
            'is_blocked'        => 'boolean',
        ];
    }

    public function getAvatarAttribute(?string $value): ?string
    {
        if (! $value) return null;
        if (str_starts_with($value, 'http')) return $value;
        return Storage::disk('public')->url($value);
    }

    public function properties(): HasMany
    {
        return $this->hasMany(Property::class);
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
