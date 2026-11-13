<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class MarketingContact extends Model
{
    protected $guarded = ['id'];

    protected $hidden = ['unsubscribe_token'];

    protected $casts = ['consented_at' => 'datetime', 'unsubscribed_at' => 'datetime'];

    public function setEmailAttribute(string $email): void
    {
        $this->attributes['email'] = mb_strtolower(trim($email));
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
