<?php

namespace App\Http\Controllers;

use App\Models\Property;
use App\Models\User;
use App\Services\SellerListingService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdvertisementManagerController extends Controller
{
    private function gate(Request $request): void
    {
        if (! in_array($request->user()->role, ['advertisement_manager', 'admin'], true)) {
            abort(403, 'Advertisement Manager access required.');
        }
    }

    // Existing-user search for the "Use Existing User" seller step —
    // scoped separately from AdminController::users() (admin-only) so
    // advertisement managers can search sellers without admin access.
    public function searchUsers(Request $request): JsonResponse
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

    // Listings created by the currently logged-in advertisement manager.
    public function index(Request $request): JsonResponse
    {
        $this->gate($request);

        $query = Property::where('created_by_id', $request->user()->id)
            ->with('user:id,name,email,phone,avatar')
            ->latest();

        if ($request->filled('listing_type')) {
            $query->where('listing_type', $request->listing_type);
        }

        if ($request->filled('search')) {
            $s = $request->search;
            $query->where(function ($q) use ($s) {
                $q->where('title', 'like', "%{$s}%")
                  ->orWhereHas('user', function ($uq) use ($s) {
                      $uq->where('name', 'like', "%{$s}%")
                         ->orWhere('email', 'like', "%{$s}%")
                         ->orWhere('phone', 'like', "%{$s}%");
                  });
            });
        }

        $properties = $query->paginate($request->get('per_page', 10));

        return response()->json($properties);
    }

    public function createListing(Request $request): JsonResponse
    {
        $this->gate($request);

        return response()->json(app(SellerListingService::class)->createForSeller($request, $request->user()), 201);
    }
}
