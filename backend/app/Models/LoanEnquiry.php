<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class LoanEnquiry extends Model
{
    protected $fillable = [
        'name', 'email', 'phone',
        'employment_type', 'annual_income', 'deposit_amount', 'loan_amount',
        'loan_purpose', 'property_type', 'property_state', 'estimated_property_value',
        'message', 'status',
    ];
}
