<?php

namespace App\Http\Controllers;

use App\Models\Inquiry;
use App\Models\LoanEnquiry;
use App\Models\Property;
use App\Models\PropertyImage;
use App\Models\User;
use App\Services\SellerListingService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

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

        $query = User::where('role', '!=', 'advertisement_manager')->latest();

        if ($request->filled('role')) {
            $query->where('role', $request->role);
        }

        if ($request->filled('search')) {
            $s = $request->search;
            $query->where(function ($q) use ($s) {
                $q->where('name', 'like', "%{$s}%")
                  ->orWhere('email', 'like', "%{$s}%")
                  ->orWhere('phone', 'like', "%{$s}%");
            });
        }

        return response()->json($query->paginate(5));
    }

    // Advertisement Managers are a separate staff role — never mixed into the
    // general Users table above; this is their own dedicated listing.
    public function advertisementManagers(Request $request): JsonResponse
    {
        $this->gate($request);

        $query = User::where('role', 'advertisement_manager')
            ->withCount('createdListings')
            ->latest();

        if ($request->filled('search')) {
            $s = $request->search;
            $query->where(function ($q) use ($s) {
                $q->where('name', 'like', "%{$s}%")
                  ->orWhere('email', 'like', "%{$s}%")
                  ->orWhere('phone', 'like', "%{$s}%");
            });
        }

        return response()->json($query->paginate(5));
    }

    public function updateUser(Request $request, User $user): JsonResponse
    {
        $this->gate($request);

        $validated = $request->validate([
            'name'  => 'sometimes|string|max:255',
            'email' => 'sometimes|email|unique:users,email,' . $user->id,
            'role'  => 'sometimes|in:buyer,seller,agent,admin,advertisement_manager',
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

    public function toggleBlockUser(Request $request, User $user): JsonResponse
    {
        $this->gate($request);

        if ($user->id === $request->user()->id) {
            return response()->json(['message' => 'Cannot block your own account.'], 422);
        }

        $user->update(['is_blocked' => ! $user->is_blocked]);

        return response()->json($user->fresh());
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

        return response()->json($query->paginate(5));
    }

    private function calcListingFee(): float
    {
        $rows = DB::table('settings')->get()->keyBy('key');
        $fee  = (float) ($rows['listing_fee']->value        ?? 1000);
        $pct  = (float) ($rows['processing_fee_pct']->value ?? 3.3);
        return round($fee + $fee * $pct / 100, 2);
    }

    public function createProperty(Request $request): JsonResponse
    {
        $this->gate($request);

        $validated = $request->validate([
            'title'          => 'required|string|max:255',
            'price'          => 'required|integer|min:0',
            'price_per_week' => 'nullable|integer|min:0',
            'address'        => 'required|string|max:255',
            'suburb'         => 'required|string|max:100',
            'state'          => 'required|string|max:100',
            'postcode'       => 'nullable|string|max:10',
            'country'        => 'nullable|string|max:100',
            'beds'           => 'required|integer|min:0|max:20',
            'baths'          => 'required|integer|min:0|max:20',
            'cars'           => 'required|integer|min:0|max:20',
            'land_size'      => 'nullable|string|max:50',
            'property_type'  => 'required|string|max:50',
            'condition'      => 'required|in:new,used',
            'category'       => 'required|in:domestic,commercial,both',
            'listing_type'   => 'required|in:buy,rent,sold',
            'description'    => 'required|string',
            'is_featured'    => 'boolean',
            'status'         => 'in:active,inactive,sold',
            'agent_name'     => 'nullable|string|max:255',
            'agency_name'    => 'nullable|string|max:255',
            'images'         => 'nullable|array',
            'images.*'       => 'image|mimes:jpeg,png,jpg,webp|max:5120',
        ]);

        $admin = $request->user();
        $validated['agent_name']  = $validated['agent_name']  ?? $admin->name;
        $validated['agency_name'] = $validated['agency_name'] ?? $admin->name;
        $validated['listing_fee'] = 0;

        $property = $admin->properties()->create($validated);

        if ($request->hasFile('images')) {
            foreach ($request->file('images') as $index => $image) {
                $path = $image->store("properties/{$property->id}", 'public');
                PropertyImage::create([
                    'property_id' => $property->id,
                    'image_path'  => $path,
                    'is_primary'  => $index === 0,
                    'sort_order'  => $index,
                ]);
            }
        }

        $property->load('images');

        return response()->json($property, 201);
    }

    // Admin creates a listing on behalf of a seller — either an existing user,
    // or a brand-new account collected with the same fields as self-registration.
    public function createListingForSeller(Request $request): JsonResponse
    {
        $this->gate($request);

        return response()->json(app(SellerListingService::class)->createForSeller($request, $request->user()), 201);
    }

    // ── Advertisement Managers ───────────────────────────────────────────────────

    public function createAdvertisementManager(Request $request): JsonResponse
    {
        $this->gate($request);

        $validated = $request->validate([
            'name'     => 'required|string|max:255',
            'email'    => 'nullable|email|unique:users,email',
            'password' => 'required|string|min:8|confirmed',
            'phone'    => 'required|string|max:20',
        ]);

        $user = User::create([
            'name'              => $validated['name'],
            'email'             => $validated['email'] ?? null,
            'password'          => $validated['password'],
            'phone'             => $validated['phone'] ?? null,
            'role'              => 'advertisement_manager',
            'email_verified_at' => now(),
        ]);
        $user->update(['slug' => Str::slug($user->name) . '-' . $user->id]);

        return response()->json(['user' => $user], 201);
    }

    public function updateAdvertisementManager(Request $request, User $user): JsonResponse
    {
        $this->gate($request);

        if ($user->role !== 'advertisement_manager') {
            abort(404, 'Advertisement manager not found.');
        }

        $validated = $request->validate([
            'name'     => 'required|string|max:255',
            'email'    => 'nullable|email|unique:users,email,' . $user->id,
            'password' => 'nullable|string|min:8|confirmed',
            'phone'    => 'required|string|max:20',
        ]);

        $user->update([
            'name'  => $validated['name'],
            'email' => $validated['email'] ?? null,
            'phone' => $validated['phone'],
            'slug'  => Str::slug($validated['name']) . '-' . $user->id,
        ]);

        if (! empty($validated['password'])) {
            $user->update(['password' => $validated['password']]);
        }

        return response()->json(['user' => $user->fresh()]);
    }

    public function updateProperty(Request $request, Property $property): JsonResponse
    {
        $this->gate($request);

        $validated = $request->validate([
            'status'         => 'sometimes|in:active,inactive,sold',
            'is_featured'    => 'sometimes|boolean',
            'listing_type'   => 'sometimes|in:buy,rent,sold',
            'title'          => 'sometimes|string|max:255',
            'price'          => 'sometimes|integer|min:0',
            'price_per_week' => 'nullable|integer|min:0',
            'address'        => 'sometimes|string|max:255',
            'suburb'         => 'sometimes|string|max:100',
            'state'          => 'sometimes|string|max:100',
            'postcode'       => 'nullable|string|max:10',
            'country'        => 'nullable|string|max:100',
            'beds'           => 'sometimes|integer|min:0|max:20',
            'baths'          => 'sometimes|integer|min:0|max:20',
            'cars'           => 'sometimes|integer|min:0|max:20',
            'land_size'      => 'nullable|string|max:50',
            'property_type'  => 'sometimes|string|max:50',
            'condition'      => 'sometimes|in:new,used',
            'category'       => 'sometimes|in:domestic,commercial,both',
            'description'    => 'sometimes|string',
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

        return response()->json($query->paginate(5));
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

        return response()->json($query->paginate(5));
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

    // ── Pricing Settings ──────────────────────────────────────────────────────

    public function publicSettings(): JsonResponse
    {
        $rows = DB::table('settings')->get()->keyBy('key');

        return response()->json([
            'listing_fee'        => (float) ($rows['listing_fee']->value        ?? 1000),
            'processing_fee_pct' => (float) ($rows['processing_fee_pct']->value ?? 3.3),
            'commission_pct'     => 0,
        ]);
    }

    public function getSettings(Request $request): JsonResponse
    {
        $this->gate($request);

        $rows = DB::table('settings')->get()->keyBy('key');

        return response()->json([
            'listing_fee'        => (float) ($rows['listing_fee']->value        ?? 1000),
            'processing_fee_pct' => (float) ($rows['processing_fee_pct']->value ?? 3.3),
            'commission_pct'     => (float) ($rows['commission_pct']->value     ?? 0),
        ]);
    }

    public function updateSettings(Request $request): JsonResponse
    {
        $this->gate($request);

        $validated = $request->validate([
            'listing_fee'        => 'required|numeric|min:0',
            'processing_fee_pct' => 'required|numeric|min:0|max:100',
            'commission_pct'     => 'required|numeric|min:0|max:100',
        ]);

        foreach ($validated as $key => $value) {
            DB::table('settings')->updateOrInsert(['key' => $key], ['value' => $value]);
        }

        return response()->json($validated);
    }
}
