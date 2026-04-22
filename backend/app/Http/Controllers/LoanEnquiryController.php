<?php

namespace App\Http\Controllers;

use App\Models\LoanEnquiry;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class LoanEnquiryController extends Controller
{
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name'                     => 'required|string|max:255',
            'email'                    => 'required|email|max:255',
            'phone'                    => 'nullable|string|max:20',
            'employment_type'          => 'required|in:full_time,part_time,self_employed,casual',
            'annual_income'            => 'required|integer|min:1',
            'deposit_amount'           => 'required|integer|min:0',
            'loan_amount'              => 'required|integer|min:1',
            'loan_purpose'             => 'required|in:buy_home,investment,refinance',
            'property_type'            => 'required|string|max:50',
            'property_state'           => 'required|string|max:10',
            'estimated_property_value' => 'nullable|integer|min:0',
            'message'                  => 'nullable|string|max:2000',
        ]);

        $enquiry = LoanEnquiry::create($validated);

        return response()->json($enquiry, 201);
    }
}
