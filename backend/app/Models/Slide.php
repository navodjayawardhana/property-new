<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Storage;

class Slide extends Model
{
    protected $fillable = [
        'title',
        'subtitle',
        'media_type',
        'media_path',
        'sort_order',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'is_active'  => 'boolean',
            'sort_order' => 'integer',
        ];
    }

    public function getMediaUrlAttribute(): string
    {
        if (str_starts_with($this->media_path, 'http')) {
            return $this->media_path;
        }
        return Storage::disk('public')->url($this->media_path);
    }
}
