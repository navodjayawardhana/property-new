<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class EmailCampaign extends Model
{
    protected $guarded = ['id'];

    protected $attributes = ['status' => 'draft'];

    protected $casts = ['contact_ids' => 'array', 'confirmed_at' => 'datetime', 'completed_at' => 'datetime'];

    public function recipients()
    {
        return $this->hasMany(CampaignRecipient::class, 'campaign_id');
    }
}
