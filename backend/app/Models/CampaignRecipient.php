<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CampaignRecipient extends Model
{
    protected $guarded = ['id'];

    protected $casts = ['available_at' => 'datetime', 'claimed_at' => 'datetime', 'sent_at' => 'datetime'];

    public function campaign()
    {
        return $this->belongsTo(EmailCampaign::class, 'campaign_id');
    }

    public function contact()
    {
        return $this->belongsTo(MarketingContact::class, 'contact_id');
    }

    public function sendAttempts()
    {
        return $this->hasMany(EmailSendAttempt::class, 'recipient_id');
    }
}
