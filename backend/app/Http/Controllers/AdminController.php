<?php

namespace App\Http\Controllers;

use App\Models\Inquiry;
use App\Models\LoanEnquiry;
use App\Models\Property;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class AdminController extends Controller
{
    private function gate(Request $request): void
    {
        if ($request->user()->role !== 'admin') {
            abort(403, 'Admin access required.');
        }
    }

    // ── Stats ─────────────────────────────────────────────────────────────────

    public function stats(Request $request): JsonResponse
    {
        $this->gate($request);

        return response()->json([
            'users' => [
                'total'         => User::count(),
                'buyers'        => User::where('role', 'buyer')->count(),
                'sellers'       => User::where('role', 'seller')->count(),
                'agents'        => User::where('role', 'agent')->count(),
                'admins'        => User::where('role', 'admin')->count(),
                'new_this_week' => User::where('created_at', '>=', now()->subWeek())->count(),
            ],
            'properties' => [
                'total'         => Property::count(),
                'active'        => Property::where('status', 'active')->count(),
                'inactive'      => Property::where('status', 'inactive')->count(),
                'sold'          => Property::where('status', 'sold')->count(),
                'featured'      => Property::where('is_featured', true)->count(),
                'buy'           => Property::where('listing_type', 'buy')->count(),
                'rent'          => Property::where('listing_type', 'rent')->count(),
                'new_this_week' => Property::where('created_at', '>=', now()->subWeek())->count(),
            ],
            'inquiries' => [
                'total'         => Inquiry::count(),
                'pending'       => Inquiry::where('status', 'pending')->count(),
                'contacted'     => Inquiry::where('status', 'contacted')->count(),
                'resolved'      => Inquiry::where('status', 'resolved')->count(),
                'new_this_week' => Inquiry::where('created_at', '>=', now()->subWeek())->count(),
            ],
        ]);
    }

    // ── Users ─────────────────────────────────────────────────────────────────

    public function users(Request $request): JsonResponse
    {
        $this->gate($request);

        $query = User::latest();

        if ($request->filled('role')) {
            $query->where('role', $request->role);
        }

        if ($request->filled('search')) {
            $s = $request->search;
            $query->where(function ($q) use ($s) {
                $q->where('name', 'like', "%{$s}%")
                  ->orWhere('email', 'like', "%{$s}%");
            });
        }

        return response()->json($query->paginate(20));
    }

    public function updateUser(Request $request, User $user): JsonResponse
    {
        $this->gate($request);

        $validated = $request->validate([
            'name'  => 'sometimes|string|max:255',
            'email' => 'sometimes|email|unique:users,email,' . $user->id,
            'role'  => 'sometimes|in:buyer,seller,agent,admin',
            'phone' => 'sometimes|nullable|string|max:20',
        ]);

        $user->update($validated);

        return response()->json($user->fresh());
    }

    public function deleteUser(Request $request, User $user): JsonResponse
    {
        $this->gate($request);

        if ($user->id === $request->user()->id) {
            return response()->json(['message' => 'Cannot delete your own account.'], 422);
        }

        $user->delete();

        return response()->json(['message' => 'User deleted.']);
    }

    // ── Properties ────────────────────────────────────────────────────────────

    public function properties(Request $request): JsonResponse
    {
        $this->gate($request);

        $query = Property::with(['images', 'user:id,name,email,avatar'])->latest();

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('listing_type')) {
            $query->where('listing_type', $request->listing_type);
        }

        if ($request->filled('featured')) {
            $query->where('is_featured', filter_var($request->featured, FILTER_VALIDATE_BOOLEAN));
        }

        if ($request->filled('search')) {
            $s = $request->search;
            $query->where(function ($q) use ($s) {
                $q->where('title', 'like', "%{$s}%")
                  ->orWhere('suburb', 'like', "%{$s}%")
                  ->orWhere('address', 'like', "%{$s}%")
                  ->orWhere('state', 'like', "%{$s}%");
            });
        }

        return response()->json($query->paginate(20));
    }

    public function updateProperty(Request $request, Property $property): JsonResponse
    {
        $this->gate($request);

        $validated = $request->validate([
            'status'      => 'sometimes|in:active,inactive,sold',
            'is_featured' => 'sometimes|boolean',
            'listing_type'=> 'sometimes|in:buy,rent,sold',
        ]);

        $property->update($validated);
        $property->load('images', 'user');

        return response()->json($property);
    }

    public function deleteProperty(Request $request, Property $property): JsonResponse
    {
        $this->gate($request);

        foreach ($property->images as $image) {
            Storage::disk('public')->delete($image->image_path);
        }

        $property->delete();

        return response()->json(['message' => 'Property deleted.']);
    }

    // ── Inquiries ─────────────────────────────────────────────────────────────

    public function inquiries(Request $request): JsonResponse
    {
        $this->gate($request);

        $query = Inquiry::with([
            'property:id,title,suburb,state,listing_type,price,price_per_week',
            'user:id,name,email,avatar',
        ])->latest();

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('inquiry_type')) {
            $query->where('inquiry_type', $request->inquiry_type);
        }

        if ($request->filled('search')) {
            $s = $request->search;
            $query->where(function ($q) use ($s) {
                $q->where('name', 'like', "%{$s}%")
                  ->orWhere('email', 'like', "%{$s}%")
                  ->orWhere('message', 'like', "%{$s}%");
            });
        }

        return response()->json($query->paginate(20));
    }

    public function updateInquiry(Request $request, Inquiry $inquiry): JsonResponse
    {
        $this->gate($request);

        $validated = $request->validate([
            'status' => 'required|in:pending,contacted,resolved',
        ]);

        $inquiry->update($validated);

        return response()->json($inquiry);
    }

    public function deleteInquiry(Request $request, Inquiry $inquiry): JsonResponse
    {
        $this->gate($request);

        $inquiry->delete();

        return response()->json(['message' => 'Inquiry deleted.']);
    }

    // ── Loan Enquiries ────────────────────────────────────────────────────────

    public function loanEnquiries(Request $request): JsonResponse
    {
        $this->gate($request);

        $query = LoanEnquiry::latest();

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('search')) {
            $s = $request->search;
            $query->where(function ($q) use ($s) {
                $q->where('name', 'like', "%{$s}%")
                  ->orWhere('email', 'like', "%{$s}%");
            });
        }

        return response()->json($query->paginate(20));
    }

    public function updateLoanEnquiry(Request $request, LoanEnquiry $loanEnquiry): JsonResponse
    {
        $this->gate($request);

        $validated = $request->validate([
            'status' => 'required|in:new,in_review,pre_approved,declined',
        ]);

        $loanEnquiry->update($validated);

        return response()->json($loanEnquiry);
    }

    public function deleteLoanEnquiry(Request $request, LoanEnquiry $loanEnquiry): JsonResponse
    {
        $this->gate($request);

        $loanEnquiry->delete();

        return response()->json(['message' => 'Loan enquiry deleted.']);
    }
}
