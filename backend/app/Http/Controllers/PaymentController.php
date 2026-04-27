<?php

namespace App\Http\Controllers;

use App\Models\PendingListing;
use App\Models\PropertyImage;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use App\Mail\PaymentReceipt;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

class PaymentController extends Controller
{
    private function settings(): array
    {
        $rows = DB::table('settings')->get()->keyBy('key');
        return [
            'listing_fee'        => (float) ($rows['listing_fee']->value        ?? 1000),
            'processing_fee_pct' => (float) ($rows['processing_fee_pct']->value ?? 3.3),
            'commission_pct'     => (float) ($rows['commission_pct']->value     ?? 0),
        ];
    }

    public function initiate(Request $request): JsonResponse
    {
        // Step 1 — verify OTP (generated in send-listing-otp step)
        $request->validate(['listing_otp' => 'required|string|size:6']);

        $user = $request->user();

        if ($user->otp !== $request->listing_otp
            || ! $user->otp_expires_at
            || now()->isAfter($user->otp_expires_at)) {
            return response()->json([
                'message' => 'Invalid or expired verification code.',
                'errors'  => ['listing_otp' => ['Invalid or expired verification code.']],
            ], 422);
        }

        $user->update(['otp' => null, 'otp_expires_at' => null]);

        // Step 2 — validate listing fields
        $request->validate([
            'title'          => 'required|string|max:255',
            'price'          => 'required|integer|min:1',
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
            'images'         => 'nullable|array',
            'images.*'       => 'image|mimes:jpeg,png,jpg,webp|max:5120',
        ]);

        // Step 3 — generate order: flat listing fee + processing fee (from settings)
        $cfg            = $this->settings();
        $orderId        = 'GB-' . strtoupper(uniqid());
        $listingPrice   = (float) $request->price;
        $listingFee     = $cfg['listing_fee'];
        $processingFee  = round($listingFee * $cfg['processing_fee_pct'] / 100, 2);
        $paymentAmount  = $listingFee + $processingFee;

        // Step 4 — persist images to temporary storage
        $imagePaths = [];
        if ($request->hasFile('images')) {
            foreach ($request->file('images') as $index => $image) {
                $path         = $image->store("pending/{$orderId}", 'public');
                $imagePaths[] = [
                    'image_path' => $path,
                    'is_primary' => $index === 0,
                    'sort_order' => $index,
                ];
            }
        }

        // Step 5 — save pending listing (no file objects in JSON)
        $listingData                = $request->only([
            'title', 'price', 'price_per_week', 'address', 'suburb', 'state',
            'postcode', 'country', 'beds', 'baths', 'cars', 'land_size',
            'property_type', 'condition', 'category', 'listing_type',
            'description', 'is_featured', 'status',
        ]);
        $listingData['agent_name']    = $user->name;
        $listingData['agency_name']   = $user->name;
        $listingData['image_paths']   = $imagePaths;
        $listingData['listing_fee']   = $listingFee;
        $listingData['processing_fee']= $processingFee;

        PendingListing::create([
            'user_id'        => $user->id,
            'order_id'       => $orderId,
            'listing_data'   => $listingData,
            'listing_price'  => $listingPrice,
            'payment_amount' => $paymentAmount,
        ]);

        // Step 6 — build PayHere form data
        $merchantId     = config('services.payhere.merchant_id');
        $merchantSecret = config('services.payhere.merchant_secret');
        $currency       = 'LKR';
        $amount         = number_format($paymentAmount, 2, '.', '');

        $hash = strtoupper(md5(
            $merchantId . $orderId . $amount . $currency . strtoupper(md5($merchantSecret))
        ));

        $nameParts   = explode(' ', trim($user->name), 2);
        $firstName   = $nameParts[0];
        $lastName    = $nameParts[1] ?? '.';
        $frontendUrl = rtrim(env('FRONTEND_URL', 'http://localhost:3000'), '/');
        $backendUrl  = rtrim(config('app.url'), '/');
        $checkoutUrl = config('services.payhere.sandbox')
            ? 'https://sandbox.payhere.lk/pay/checkout'
            : 'https://www.payhere.lk/pay/checkout';

        return response()->json([
            'checkout_url' => $checkoutUrl,
            'order_id'     => $orderId,
            'merchant_id'  => $merchantId,
            'amount'       => $amount,
            'currency'     => $currency,
            'items'        => 'Greenbrick Listing Fee',
            'first_name'   => $firstName,
            'last_name'    => $lastName,
            'email'        => $user->email ?? '',
            'phone'        => $user->phone ?? '0000000000',
            'address'      => $request->address,
            'city'         => $request->suburb,
            'country'      => $request->country ?? 'Sri Lanka',
            'return_url'   => "{$frontendUrl}/dashboard/properties/payment-return?order_id={$orderId}",
            'cancel_url'   => "{$frontendUrl}/dashboard/properties/payment-return?order_id={$orderId}&cancelled=1",
            'notify_url'   => "{$backendUrl}/api/payment/notify",
            'hash'         => $hash,
        ]);
    }

    // Called server-to-server by PayHere — must be a public route (no auth)
    public function notify(Request $request): Response
    {
        $merchantId     = config('services.payhere.merchant_id');
        $merchantSecret = config('services.payhere.merchant_secret');

        $orderId         = $request->input('order_id', '');
        $payhereAmount   = $request->input('payhere_amount', '');
        $payhereCurrency = $request->input('payhere_currency', '');
        $statusCode      = $request->input('status_code', '');
        $md5sig          = strtoupper($request->input('md5sig', ''));

        $localHash = strtoupper(md5(
            $merchantId . $orderId . $payhereAmount . $payhereCurrency . $statusCode . strtoupper(md5($merchantSecret))
        ));

        if ($localHash !== $md5sig) {
            Log::warning("PayHere: hash mismatch for order {$orderId}");
            return response('HASH_MISMATCH', 400);
        }

        $pending = PendingListing::where('order_id', $orderId)->first();

        if (! $pending || $pending->payment_status === 'completed') {
            return response('OK', 200);
        }

        if ((int) $statusCode === 2) {
            DB::transaction(function () use ($pending, $orderId) {
                $locked = PendingListing::lockForUpdate()->find($pending->id);
                if ($locked->payment_status === 'completed') return;

                $user     = User::findOrFail($locked->user_id);
                $property = $this->createPropertyFromPending($locked, $user);

                $locked->update([
                    'payment_status' => 'completed',
                    'property_id'    => $property->id,
                ]);

                Log::info("PayHere: listing {$property->id} created via notify_url for order {$orderId}");
            });
        } elseif (in_array((int) $statusCode, [-1, -2], true)) {
            $pending->update(['payment_status' => 'failed']);
        }

        return response('OK', 200);
    }

    public function status(Request $request, string $orderId): JsonResponse
    {
        $pending = PendingListing::where('order_id', $orderId)
            ->where('user_id', $request->user()->id)
            ->first();

        if (! $pending) {
            return response()->json(['status' => 'not_found'], 404);
        }

        return response()->json([
            'status'      => $pending->payment_status,
            'property_id' => $pending->property_id,
        ]);
    }

    // Called by the frontend after the user returns from PayHere checkout.
    // Acts as a fallback when the server-to-server notify_url cannot reach localhost.
    // Uses a row lock so it is safe even if notify_url and this endpoint fire simultaneously.
    public function complete(Request $request, string $orderId): JsonResponse
    {
        $pending = PendingListing::where('order_id', $orderId)
            ->where('user_id', $request->user()->id)
            ->first();

        if (! $pending) {
            return response()->json(['message' => 'Order not found.'], 404);
        }

        if ($pending->payment_status === 'completed') {
            return response()->json([
                'status'      => 'completed',
                'property_id' => $pending->property_id,
            ]);
        }

        if ($pending->payment_status === 'failed') {
            return response()->json(['message' => 'Payment was not successful.'], 422);
        }

        $propertyId = DB::transaction(function () use ($pending, $request) {
            $locked = PendingListing::lockForUpdate()->find($pending->id);

            if ($locked->payment_status === 'completed') {
                return $locked->property_id;
            }

            $property = $this->createPropertyFromPending($locked, $request->user());

            $locked->update([
                'payment_status' => 'completed',
                'property_id'    => $property->id,
            ]);

            Log::info("PayHere: listing {$property->id} created via return-url for order {$locked->order_id}");

            return $property->id;
        });

        // Send receipt email (outside transaction so it doesn't block the DB lock)
        $this->sendReceiptEmail($pending->fresh(), $request->user());

        return response()->json([
            'status'      => 'completed',
            'property_id' => $propertyId,
        ]);
    }

    public function receipt(Request $request, string $orderId): JsonResponse
    {
        $pending = PendingListing::where('order_id', $orderId)
            ->where('user_id', $request->user()->id)
            ->first();

        if (! $pending || $pending->payment_status !== 'completed') {
            return response()->json(['message' => 'Receipt not available.'], 404);
        }

        $listingData = $pending->listing_data;
        $user        = $request->user();

        return response()->json([
            'order_id'        => $pending->order_id,
            'paid_at'         => $pending->updated_at->format('d M Y, H:i'),
            'user_name'       => $user->name,
            'user_email'      => $user->email,
            'listing_title'   => $listingData['title'] ?? '',
            'listing_address' => ($listingData['address'] ?? '') . ', ' . ($listingData['suburb'] ?? ''),
            'listing_price'   => (float) ($listingData['price'] ?? 0),
            'listing_fee'     => (float) ($listingData['listing_fee'] ?? self::LISTING_FEE),
            'processing_fee'  => (float) ($listingData['processing_fee'] ?? 0),
            'payment_amount'  => $pending->payment_amount,
            'property_id'     => $pending->property_id,
        ]);
    }

    private function sendReceiptEmail(PendingListing $pending, User $user): void
    {
        if (! $user->email) return;

        try {
            $listingData = $pending->listing_data;

            Mail::to($user->email)->send(new PaymentReceipt(
                orderId:        $pending->order_id,
                userName:       $user->name,
                userEmail:      $user->email,
                listingTitle:   $listingData['title'] ?? '',
                listingAddress: ($listingData['address'] ?? '') . ', ' . ($listingData['suburb'] ?? ''),
                listingPrice:   (float) ($listingData['price'] ?? 0),
                listingFee:     (float) ($listingData['listing_fee'] ?? self::LISTING_FEE),
                processingFee:  (float) ($listingData['processing_fee'] ?? 0),
                paymentAmount:  $pending->payment_amount,
                paidAt:         $pending->updated_at->format('d M Y, H:i'),
            ));
        } catch (\Throwable $e) {
            Log::error("PayHere: failed to send receipt for order {$pending->order_id}: {$e->getMessage()}");
        }
    }

    private function createPropertyFromPending(PendingListing $pending, User $user)
    {
        $listingData             = $pending->listing_data;
        $imagePaths              = $listingData['image_paths'] ?? [];

        unset($listingData['image_paths']);

        $listingData['order_id'] = $pending->order_id;

        $property = $user->properties()->create($listingData);

        foreach ($imagePaths as $imgData) {
            PropertyImage::create([
                'property_id' => $property->id,
                'image_path'  => $imgData['image_path'],
                'is_primary'  => (bool) $imgData['is_primary'],
                'sort_order'  => (int) $imgData['sort_order'],
            ]);
        }

        return $property;
    }
}
