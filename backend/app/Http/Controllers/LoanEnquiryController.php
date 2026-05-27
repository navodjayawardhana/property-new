<?php

namespace App\Http\Controllers;

use App\Mail\LoanEnquiryNotification;
use App\Models\LoanEnquiry;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

class LoanEnquiryController extends Controller
{
    private array $rules = [
        'name'                     => 'required|string|max:255',
        'selected_bank'            => 'nullable|string|max:255',
        'nic_number'               => 'nullable|string|max:20',
        'email'                    => 'required|email|max:255',
        'phone'                    => 'nullable|string|max:20',
        'employment_type'          => 'required|in:full_time,part_time,self_employed,casual',
        'annual_income'            => 'required|integer|min:1',
        'deposit_amount'           => 'required|integer|min:0',
        'loan_amount'              => 'required|integer|min:1',
        'loan_term'                => 'nullable|integer|min:1|max:30',
        'loan_purpose'             => 'required|in:buy_home,investment,refinance',
        'property_type'            => 'required|string|max:50',
        'property_state'           => 'required|string|max:100',
        'estimated_property_value' => 'nullable|integer|min:0',
        'message'                  => 'nullable|string|max:2000',
    ];

    // Public: guest submission (no user_id)
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate($this->rules);
        $enquiry   = LoanEnquiry::create($validated);
        $this->notifyAdmin($enquiry);

        return response()->json($enquiry, 201);
    }

    // Protected: authenticated user submission (saves user_id)
    public function storeAuth(Request $request): JsonResponse
    {
        $validated            = $request->validate($this->rules);
        $validated['user_id'] = $request->user()->id;
        $enquiry              = LoanEnquiry::create($validated);
        $this->notifyAdmin($enquiry);

        return response()->json($enquiry, 201);
    }

    private function notifyAdmin(LoanEnquiry $enquiry): void
    {
        $adminEmail = env('ADMIN_EMAIL', config('mail.from.address'));
        if (!$adminEmail) return;

        try {
            Mail::to($adminEmail)->send(new LoanEnquiryNotification($enquiry));
        } catch (\Throwable $e) {
            Log::error('Failed to queue loan enquiry email: ' . $e->getMessage());
        }
    }

    // Protected: list the authenticated user's own enquiries
    public function myEnquiries(Request $request): JsonResponse
    {
        $enquiries = LoanEnquiry::where('user_id', $request->user()->id)
            ->orderByDesc('created_at')
            ->get();

        return response()->json($enquiries);
    }
}
