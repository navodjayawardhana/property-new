<?php

namespace App\Http\Controllers;

use App\Models\Inquiry;
use App\Models\Property;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

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
            'user_id'      => $request->user()?->id,
            'inquiry_type' => $validated['inquiry_type'] ?? 'general',
        ]);

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
            ->with('property:id,title,address,suburb')
            ->latest()
            ->get();

        return response()->json($inquiries);
    }
}
