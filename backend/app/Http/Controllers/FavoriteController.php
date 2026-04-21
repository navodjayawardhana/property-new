<?php

namespace App\Http\Controllers;

use App\Models\Favorite;
use App\Models\Property;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class FavoriteController extends Controller
{
    /**
     * GET /favorites
     * Returns full property objects the authenticated user has saved.
     */
    public function index(Request $request): JsonResponse
    {
        $ids = Favorite::where('user_id', $request->user()->id)
            ->latest()
            ->pluck('property_id');

        if ($ids->isEmpty()) {
            return response()->json([]);
        }

        $properties = Property::with('images')
            ->whereIn('id', $ids)
            ->orderByRaw('FIELD(id, ' . $ids->implode(',') . ')')
            ->get();

        return response()->json($properties);
    }

    /**
     * GET /favorites/ids
     * Returns a plain array of property IDs the user has saved.
     * Used by the frontend to sync the heart icon state on page load.
     */
    public function ids(Request $request): JsonResponse
    {
        $ids = Favorite::where('user_id', $request->user()->id)->pluck('property_id');
        return response()->json($ids);
    }

    /**
     * POST /favorites/{property}
     * Toggle save/unsave. Returns { saved: bool }.
     */
    public function toggle(Request $request, Property $property): JsonResponse
    {
        $userId = $request->user()->id;

        $existing = Favorite::where('user_id', $userId)
            ->where('property_id', $property->id)
            ->first();

        if ($existing) {
            $existing->delete();
            return response()->json(['saved' => false]);
        }

        Favorite::create(['user_id' => $userId, 'property_id' => $property->id]);
        return response()->json(['saved' => true]);
    }
}
