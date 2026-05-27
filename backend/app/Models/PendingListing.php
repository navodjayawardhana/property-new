<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PendingListing extends Model
{
    protected $fillable = [
        'user_id',
        'order_id',
        'listing_data',
        'listing_price',
        'payment_amount',
        'payment_status',
        'property_id',
    ];

    protected $casts = [
        'listing_data'   => 'array',
        'listing_price'  => 'float',
        'payment_amount' => 'float',
    ];
}
