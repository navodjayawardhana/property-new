<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class LoanEnquiry extends Model
{
    protected $fillable = [
        'user_id', 'name', 'selected_bank', 'nic_number', 'email', 'phone',
        'employment_type', 'annual_income', 'deposit_amount', 'loan_amount', 'loan_term',
        'loan_purpose', 'property_type', 'property_state', 'estimated_property_value',
        'message', 'status',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
