<?php

namespace App\Services;

use App\Models\Property;
use App\Models\PropertyImage;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class SellerListingService
{
    // Creates a listing on behalf of a seller — either an existing user,
    // or a brand-new account collected with the same fields as self-registration.
    // $actingUser is the admin/advertisement manager performing the action.
    public function createForSeller(Request $request, User $actingUser): array
    {
        $request->validate(['seller_mode' => 'required|in:existing,new']);

        $seller = null;
        $sellerData = null;
        $plainPassword = null;
        $newAccountCreated = false;

        if ($request->input('seller_mode') === 'existing') {
            $request->validate(['seller_id' => 'required|exists:users,id']);
            $seller = User::findOrFail($request->seller_id);
        } else {
            $sellerData = $request->validate([
                'seller_name'     => 'required|string|max:255',
                'seller_email'    => 'nullable|email|unique:users,email',
                'seller_phone'    => 'nullable|string|max:20',
                'seller_role'     => 'nullable|in:buyer,seller,agent',
                'seller_country'  => 'nullable|string|max:100',
                'seller_state'    => 'nullable|string|max:100',
                'seller_district' => 'nullable|string|max:100',
                'seller_suburb'   => 'nullable|string|max:100',
            ]);
            $plainPassword = Str::password(12);
            $newAccountCreated = true;
        }

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

        $property = null;

        DB::transaction(function () use ($request, &$seller, $sellerData, $validated, $newAccountCreated, $plainPassword, $actingUser, &$property) {
            if ($newAccountCreated) {
                $seller = User::create([
                    'name'              => $sellerData['seller_name'],
                    'email'             => $sellerData['seller_email'] ?? null,
                    'password'          => $plainPassword,
                    'phone'             => $sellerData['seller_phone'] ?? null,
                    'role'              => $sellerData['seller_role'] ?? 'seller',
                    'country'           => $sellerData['seller_country'] ?? null,
                    'state'             => $sellerData['seller_state'] ?? null,
                    'district'          => $sellerData['seller_district'] ?? null,
                    'suburb'            => $sellerData['seller_suburb'] ?? null,
                    'email_verified_at' => now(),
                ]);
                $seller->update(['slug' => Str::slug($seller->name) . '-' . $seller->id]);
            }

            $validated['agent_name']    = $validated['agent_name']  ?? $seller->name;
            $validated['agency_name']   = $validated['agency_name'] ?? $seller->name;
            $validated['listing_fee']   = 0;
            $validated['created_by_id'] = $actingUser->id;
            $validated['is_featured']   = true;

            $property = $seller->properties()->create($validated);

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
        });

        $property->load('images');

        if ($newAccountCreated && $seller->phone) {
            $this->sendNewSellerWelcomeSms($seller, $property, $plainPassword);
        }

        return [
            'property'           => $property,
            'seller'             => $seller,
            'temporary_password' => $newAccountCreated ? $plainPassword : null,
        ];
    }

    private function normalizePhone(string $phone): string
    {
        $digits = preg_replace('/\D/', '', $phone);
        if (str_starts_with($digits, '0')) {
            return '94' . substr($digits, 1);
        }
        if (! str_starts_with($digits, '94')) {
            return '94' . $digits;
        }
        return $digits;
    }

    private function sendNewSellerWelcomeSms(User $seller, Property $property, string $plainPassword): void
    {
        $sendTo      = $this->normalizePhone($seller->phone);
        $frontendUrl = rtrim(config('app.frontend_url', 'http://localhost:3000'), '/');
        $listingUrl  = "{$frontendUrl}/property/{$property->id}";
        $signinUrl   = "{$frontendUrl}/signin";

        $listingTypeLabel = match ($property->listing_type) {
            'rent' => 'For Rent',
            'sold' => 'Sold',
            default => 'For Sale',
        };

        $priceText = $property->listing_type === 'rent' && $property->price_per_week
            ? "LKR {$property->price_per_week}/week"
            : "LKR {$property->price}";

        $loginId = $seller->email ? "Email: {$seller->email}" : "Phone: {$seller->phone}";

        $message = "Hi {$seller->name}, welcome to GreenBricks! Your listing \"{$property->title}\" "
            . "({$listingTypeLabel}, {$property->property_type}, {$property->suburb}, {$property->state}) "
            . "is live at {$priceText}. View it: {$listingUrl} "
            . "Login to manage it: {$signinUrl} — {$loginId} / Password: {$plainPassword}";

        // TLS verification is skipped only on local dev boxes that lack a CA bundle.
        $smsResponse = Http::withOptions(['verify' => ! app()->isLocal()])->post('https://app.notify.lk/api/v1/send', [
            'user_id'   => config('services.notify_lk.user_id'),
            'api_key'   => config('services.notify_lk.api_key'),
            'sender_id' => config('services.notify_lk.service_id'),
            'to'        => $sendTo,
            'message'   => $message,
        ]);

        if ($smsResponse->failed() || $smsResponse->json('status') !== 'success') {
            Log::error('notify.lk welcome SMS failed', [
                'status' => $smsResponse->status(),
                'body'   => $smsResponse->body(),
                'to'     => $sendTo,
            ]);
        }
    }
}
