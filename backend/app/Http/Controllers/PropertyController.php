<?php

namespace App\Http\Controllers;

use App\Models\Property;
use App\Models\PropertyImage;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class PropertyController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Property::with('images')->latest();

        if ($request->filled('user_id')) {
            $query->where('user_id', (int) $request->user_id);
        }

        if ($request->filled('listing_type')) {
            $query->where('listing_type', $request->listing_type);
        }

        // Full-text keyword search across title, address, suburb, postcode, state
        if ($request->filled('q')) {
            $q = $request->q;
            $query->where(function ($builder) use ($q) {
                $builder->where('title', 'like', "%{$q}%")
                        ->orWhere('address', 'like', "%{$q}%")
                        ->orWhere('suburb', 'like', "%{$q}%")
                        ->orWhere('postcode', 'like', "%{$q}%")
                        ->orWhere('state', 'like', "%{$q}%")
                        ->orWhere('description', 'like', "%{$q}%");
            });
        }

        if ($request->filled('property_type')) {
            $types = is_array($request->property_type)
                ? $request->property_type
                : explode(',', $request->property_type);
            $query->whereIn('property_type', $types);
        }

        if ($request->filled('suburb')) {
            $query->where('suburb', 'like', '%' . $request->suburb . '%');
        }

        if ($request->filled('state')) {
            $query->where('state', $request->state);
        }

        if ($request->filled('postcode')) {
            $query->where('postcode', 'like', $request->postcode . '%');
        }

        if ($request->filled('min_price')) {
            $query->where('price', '>=', (int) $request->min_price);
        }

        if ($request->filled('max_price')) {
            $query->where('price', '<=', (int) $request->max_price);
        }

        if ($request->filled('beds')) {
            $query->where('beds', '>=', (int) $request->beds);
        }

        if ($request->filled('baths')) {
            $query->where('baths', '>=', (int) $request->baths);
        }

        if ($request->filled('cars')) {
            $query->where('cars', '>=', (int) $request->cars);
        }

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        } else {
            $query->where('status', '!=', 'inactive');
        }

        if ($request->filled('condition')) {
            $query->where('condition', $request->condition);
        }

        if ($request->filled('category')) {
            $cat = $request->category;
            $query->where(function ($builder) use ($cat) {
                $builder->where('category', $cat)
                        ->orWhere('category', 'both');
            });
        }

        if ($request->filled('featured')) {
            $query->where('is_featured', true);
        }

        $properties = $query->paginate($request->get('per_page', 12));

        return response()->json($properties);
    }

    public function show(Property $property): JsonResponse
    {
        $property->load('images', 'user');

        return response()->json($property);
    }

    public function store(Request $request): JsonResponse
    {
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
            'sold_date'      => 'nullable|date',
            'days_listed'    => 'nullable|integer|min:0',
            'is_featured'    => 'boolean',
            'status'         => 'in:active,inactive,sold',
            'images'         => 'nullable|array',
            'images.*'       => 'image|mimes:jpeg,png,jpg,webp|max:5120',
        ]);

        $validated['agent_name']  = $request->user()->name;
        $validated['agency_name'] = $request->user()->name;

        $property = $request->user()->properties()->create($validated);

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

    public function update(Request $request, Property $property): JsonResponse
    {
        $this->authorize('update', $property);

        $validated = $request->validate([
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
            'listing_type'   => 'sometimes|in:buy,rent,sold',
            'description'    => 'sometimes|string',
            'sold_date'      => 'nullable|date',
            'days_listed'    => 'nullable|integer|min:0',
            'is_featured'    => 'boolean',
            'status'         => 'in:active,inactive,sold',
        ]);

        $validated['agent_name']  = $request->user()->name;
        $validated['agency_name'] = $request->user()->name;

        $property->update($validated);
        $property->load('images');

        return response()->json($property);
    }

    public function destroy(Property $property): JsonResponse
    {
        $this->authorize('delete', $property);

        foreach ($property->images as $image) {
            Storage::disk('public')->delete($image->image_path);
        }

        $property->delete();

        return response()->json(['message' => 'Property deleted successfully.']);
    }

    public function myProperties(Request $request): JsonResponse
    {
        $properties = $request->user()
            ->properties()
            ->with('images')
            ->latest()
            ->paginate($request->get('per_page', 50));

        return response()->json($properties);
    }

    public function uploadImages(Request $request, Property $property): JsonResponse
    {
        $this->authorize('update', $property);

        $request->validate([
            'images'   => 'required|array|min:1',
            'images.*' => 'image|mimes:jpeg,png,jpg,webp|max:5120',
        ]);

        $uploaded = [];
        $nextOrder = $property->images()->max('sort_order') + 1;
        $hasPrimary = $property->images()->where('is_primary', true)->exists();

        foreach ($request->file('images') as $index => $image) {
            $path = $image->store("properties/{$property->id}", 'public');
            $record = PropertyImage::create([
                'property_id' => $property->id,
                'image_path'  => $path,
                'is_primary'  => ! $hasPrimary && $index === 0,
                'sort_order'  => $nextOrder + $index,
            ]);
            $uploaded[] = $record;
        }

        return response()->json($uploaded, 201);
    }

    public function deleteImage(Property $property, PropertyImage $image): JsonResponse
    {
        $this->authorize('update', $property);

        Storage::disk('public')->delete($image->image_path);
        $image->delete();

        if ($image->is_primary) {
            $next = $property->images()->first();
            if ($next) {
                $next->update(['is_primary' => true]);
            }
        }

        return response()->json(['message' => 'Image deleted.']);
    }
}
