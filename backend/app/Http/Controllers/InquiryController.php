<?php

namespace App\Http\Controllers;

use App\Mail\InquiryNotification;
use App\Models\Inquiry;
use App\Models\Property;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

class InquiryController extends Controller
{
    public function store(Request $request, Property $property): JsonResponse
    {
        $validated = $request->validate([
            'name'         => 'required|string|max:100',
            'email'        => 'required|email',
            'phone'        => 'nullable|string|max:20',
            'message'      => 'required|string|max:2000',
            'inquiry_type' => 'nullable|in:buying,renting,general',
        ]);

        $inquiry = $property->inquiries()->create([
            ...$validated,
            'user_id'      => $request->user('sanctum')?->id,
            'inquiry_type' => $validated['inquiry_type'] ?? 'general',
        ]);

        // Send email notification to the property owner
        $property->loadMissing('user');
        $ownerEmail = $property->user?->email;

        if ($ownerEmail) {
            try {
                Mail::to($ownerEmail, $property->user->name)
                    ->send(new InquiryNotification($inquiry, $property));
            } catch (\Throwable $e) {
                Log::error('Failed to send inquiry email: ' . $e->getMessage());
            }
        }

        return response()->json($inquiry, 201);
    }

    public function index(Request $request, Property $property): JsonResponse
    {
        $this->authorize('view', $property);

        $inquiries = $property->inquiries()->latest()->get();

        return response()->json($inquiries);
    }

    public function myInquiries(Request $request): JsonResponse
    {
        $inquiries = $request->user()
            ->inquiries()
            ->with('property:id,title,address,suburb,state,postcode,listing_type,price,price_per_week')
            ->latest()
            ->get();

        return response()->json($inquiries);
    }

    public function receivedInquiries(Request $request): JsonResponse
    {
        $inquiries = Inquiry::whereHas('property', function ($q) use ($request) {
                $q->where('user_id', $request->user()->id);
            })
            ->with([
                'property:id,title,address,suburb,state,postcode,listing_type,price,price_per_week',
                'user:id,name,email,phone,avatar',
            ])
            ->latest()
            ->get();

        return response()->json($inquiries);
    }
}
