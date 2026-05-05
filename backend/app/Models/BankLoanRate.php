<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Storage;

class BankLoanRate extends Model
{
    protected $fillable = [
        'bank_name', 'logo_path', 'loan_type', 'interest_rate',
        'min_loan', 'max_loan', 'max_term',
        'features', 'is_active', 'sort_order',
    ];

    protected $casts = [
        'features'      => 'array',
        'is_active'     => 'boolean',
        'interest_rate' => 'float',
    ];

    public function getLogoUrlAttribute(): ?string
    {
        if (!$this->logo_path) return null;
        if (str_starts_with($this->logo_path, 'http')) return $this->logo_path;
        return Storage::disk('public')->url($this->logo_path);
    }
}
