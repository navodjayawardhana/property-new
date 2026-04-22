<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Property extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'title',
        'price',
        'price_per_week',
        'address',
        'suburb',
        'state',
        'postcode',
        'beds',
        'baths',
        'cars',
        'land_size',
        'property_type',
        'condition',
        'category',
        'listing_type',
        'description',
        'agent_name',
        'agency_name',
        'sold_date',
        'days_listed',
        'is_featured',
        'status',
    ];

    protected $casts = [
        'price' => 'integer',
        'price_per_week' => 'integer',
        'beds' => 'integer',
        'baths' => 'integer',
        'cars' => 'integer',
        'days_listed' => 'integer',
        'is_featured' => 'boolean',
        'sold_date' => 'date',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function images(): HasMany
    {
        return $this->hasMany(PropertyImage::class)->orderBy('sort_order');
    }

    public function primaryImage(): HasMany
    {
        return $this->hasMany(PropertyImage::class)->where('is_primary', true)->limit(1);
    }

    public function inquiries(): HasMany
    {
        return $this->hasMany(Inquiry::class);
    }
}
