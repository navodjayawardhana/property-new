<?php

namespace App\Http\Controllers;

use App\Mail\ContactMessage;
use App\Mail\OtpNotification;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    public function register(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name'     => 'required|string|max:255',
            'email'    => 'required|email|unique:users,email',
            'password' => 'required|string|min:8|confirmed',
            'phone'    => 'nullable|string|max:20',
            'role'     => 'nullable|in:buyer,seller,agent',
            'country'  => 'nullable|string|max:100',
            'state'    => 'nullable|string|max:100',
            'district' => 'nullable|string|max:100',
            'suburb'   => 'nullable|string|max:100',
        ]);

        $user = User::create([
            'name'     => $validated['name'],
            'email'    => $validated['email'],
            'password' => $validated['password'],
            'phone'    => $validated['phone'] ?? null,
            'role'     => $validated['role'] ?? 'buyer',
            'country'  => $validated['country'] ?? null,
            'state'    => $validated['state'] ?? null,
            'district' => $validated['district'] ?? null,
            'suburb'   => $validated['suburb'] ?? null,
        ]);

        $user->update(['slug' => Str::slug($user->name) . '-' . $user->id]);

        // Send email verification OTP
        $otp = (string) random_int(100000, 999999);
        $user->update([
            'otp'            => $otp,
            'otp_expires_at' => now()->addMinutes(10),
        ]);
        Mail::to($user->email)->send(new OtpNotification($otp, $user->name));

        $masked = $this->maskEmail($user->email);

        return response()->json([
            'requires_verification' => true,
            'email'                 => $user->email,
            'masked_email'          => $masked,
        ], 201);
    }

    public function verifyEmail(Request $request): JsonResponse
    {
        $request->validate([
            'email' => 'required|email',
            'otp'   => 'required|string|size:6',
        ]);

        $user = User::where('email', $request->email)->first();

        if (! $user || $user->otp !== $request->otp || now()->isAfter($user->otp_expires_at)) {
            throw ValidationException::withMessages([
                'otp' => ['Invalid or expired code. Please try again.'],
            ]);
        }

        $user->update([
            'otp'               => null,
            'otp_expires_at'    => null,
            'email_verified_at' => now(),
        ]);

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json(['user' => $user->fresh(), 'token' => $token]);
    }

    public function login(Request $request): JsonResponse
    {
        $request->validate([
            'email'    => 'required|string',
            'password' => 'required|string',
        ]);

        // Identifier can be an email address or a phone number (any format).
        // A phone number may be shared across several accounts (e.g. a seller
        // and an advertisement manager), so match all candidates and pick the
        // one whose password actually matches.
        $login = $request->email;
        $candidates = str_contains($login, '@')
            ? User::where('email', $login)->get()
            : User::whereIn('phone', $this->phoneVariants($login))->get();

        $user = $candidates->first(
            fn ($candidate) => $candidate->password && Hash::check($request->password, $candidate->password)
        );

        if (! $user) {
            throw ValidationException::withMessages([
                'email' => ['The provided credentials are incorrect.'],
            ]);
        }

        if ($user->is_blocked) {
            throw ValidationException::withMessages([
                'email' => ['Your account has been blocked. Please contact support.'],
            ]);
        }

        // Block login until email is verified (only for accounts that have an email)
        if ($user->email && ! $user->email_verified_at) {
            // Resend a fresh OTP so they can complete verification
            $otp = (string) random_int(100000, 999999);
            $user->update(['otp' => $otp, 'otp_expires_at' => now()->addMinutes(10)]);
            Mail::to($user->email)->send(new OtpNotification($otp, $user->name));

            return response()->json([
                'requires_verification' => true,
                'email'                 => $user->email,
                'masked_email'          => $this->maskEmail($user->email),
            ]);
        }

        // Email already verified — log in directly, no OTP needed
        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json(['user' => $user->fresh(), 'token' => $token]);
    }

    public function verifyOtp(Request $request): JsonResponse
    {
        $request->validate([
            'email' => 'required|email',
            'otp'   => 'required|string|size:6',
        ]);

        $user = User::where('email', $request->email)->first();

        if (! $user || $user->otp !== $request->otp || now()->isAfter($user->otp_expires_at)) {
            throw ValidationException::withMessages([
                'otp' => ['Invalid or expired code. Please try again.'],
            ]);
        }

        $user->update(['otp' => null, 'otp_expires_at' => null]);

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json(['user' => $user->fresh(), 'token' => $token]);
    }

    public function logout(Request $request): JsonResponse
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json(['message' => 'Logged out successfully.']);
    }

    public function me(Request $request): JsonResponse
    {
        return response()->json($request->user());
    }

    public function updateProfile(Request $request): JsonResponse
    {
        $user = $request->user();

        $validated = $request->validate([
            'name'      => 'sometimes|string|max:255',
            'email'     => 'sometimes|email|unique:users,email,' . $user->id,
            'phone'     => 'nullable|string|max:20',
            'suburb'    => 'nullable|string|max:100',
            'district'  => 'nullable|string|max:100',
            'state'     => 'nullable|string|max:100',
            'postcode'  => 'nullable|string|max:10',
            'country'   => 'nullable|string|max:100',
            'bio'       => 'nullable|string|max:2000',
            'facebook'  => 'nullable|string|max:255',
            'instagram' => 'nullable|string|max:255',
            'linkedin'  => 'nullable|string|max:255',
            'whatsapp'  => 'nullable|string|max:20',
            'twitter'   => 'nullable|string|max:255',
            'website'   => 'nullable|string|max:255',
        ]);

        $user->update($validated);

        return response()->json($user->fresh());
    }

    public function updatePassword(Request $request): JsonResponse
    {
        $request->validate([
            'current_password' => 'required|string',
            'password'         => 'required|string|min:8|confirmed',
        ]);

        if (! Hash::check($request->current_password, $request->user()->password)) {
            throw ValidationException::withMessages([
                'current_password' => ['Current password is incorrect.'],
            ]);
        }

        $request->user()->update(['password' => $request->password]);

        return response()->json(['message' => 'Password updated successfully.']);
    }

    public function uploadAvatar(Request $request): JsonResponse
    {
        $request->validate([
            'avatar' => 'required|image|mimes:jpeg,png,jpg,webp|max:2048',
        ]);

        $user = $request->user();

        $oldPath = $user->getAttributes()['avatar'] ?? null;
        if ($oldPath && ! str_starts_with($oldPath, 'http')) {
            Storage::disk('public')->delete($oldPath);
        }

        $path = $request->file('avatar')->store('avatars', 'public');
        $user->update(['avatar' => $path]);

        return response()->json($user->fresh());
    }

    public function agent(string $slug): JsonResponse
    {
        $agent = User::where('role', 'agent')
            ->where(function ($q) use ($slug) {
                $q->where('slug', $slug)->orWhere('id', is_numeric($slug) ? (int) $slug : 0);
            })
            ->firstOrFail();

        return response()->json(
            $agent->only([
                'id', 'name', 'email', 'phone', 'avatar', 'slug',
                'suburb', 'state', 'postcode', 'country', 'district',
                'bio', 'facebook', 'instagram', 'linkedin', 'whatsapp', 'twitter', 'website',
            ])
        );
    }

    public function agents(Request $request): JsonResponse
    {
        $query = User::where('role', 'agent')->orderBy('name');

        if ($request->filled('suburb')) {
            $query->where('suburb', 'like', '%' . $request->suburb . '%');
        }
        if ($request->filled('state')) {
            $query->where('state', $request->state);
        }
           if ($request->filled('district')) {
            $query->where('district', 'like', '%' . $request->district . '%');
        }
        if ($request->filled('search')) {
            $query->where('name', 'like', '%' . $request->search . '%');
        }

        $agents = $query->select([
                'id', 'name', 'email', 'phone', 'avatar', 'slug',
                'suburb', 'state', 'postcode', 'country', 'district',
            ])
            ->paginate(24);

        return response()->json($agents);
    }

    public function sendPhoneOtp(Request $request): JsonResponse
    {
        $request->validate([
            'phone' => 'required|string',
            'role'  => 'nullable|in:buyer,seller,agent',
        ]);

        $user = User::where('role', '!=', 'admin')
            ->whereIn('phone', $this->phoneVariants($request->phone))
            ->first();

        // Auto-register if no account found for this phone
        if (! $user) {
            $user = User::create([
                'name'              => 'User ' . substr(preg_replace('/\D/', '', $request->phone), -4),
                'phone'             => $request->phone,
                'role'              => $request->role ?? 'buyer',
                'email_verified_at' => now(),
            ]);
        }

        $otp    = (string) random_int(100000, 999999);
        $sendTo = $this->normalizePhone($user->phone);
        $user->update(['otp' => $otp, 'otp_expires_at' => now()->addMinutes(10)]);

        Log::info('phone-otp generated', ['to' => $sendTo, 'otp' => $otp]);

        $smsResponse = Http::withoutVerifying()->post('https://app.notify.lk/api/v1/send', [
            'user_id'   => config('services.notify_lk.user_id'),
            'api_key'   => config('services.notify_lk.api_key'),
            'sender_id' => config('services.notify_lk.service_id'),
            'to'        => $sendTo,
            'message'   => "Your Greenbrick.net login code is: {$otp}. Valid for 10 minutes.",
        ]);

        $smsFailed = $smsResponse->failed() || ($smsResponse->json('status') !== 'success');

        if ($smsFailed) {
            Log::error('notify.lk send failed', [
                'status' => $smsResponse->status(),
                'body'   => $smsResponse->body(),
                'to'     => $sendTo,
            ]);

            // In production, tell the user so they aren't left waiting
            if (! app()->isLocal()) {
                return response()->json([
                    'message' => 'Failed to send OTP to your phone number. Please check the number and try again, or use email login.',
                ], 422);
            }
        }

        $masked = $this->maskPhone($user->phone);

        $response = ['requires_otp' => true, 'masked_phone' => $masked];
        if (app()->isLocal()) {
            $response['dev_otp'] = $otp;
        }

        return response()->json($response);
    }

    public function verifyPhoneOtp(Request $request): JsonResponse
    {
        $request->validate([
            'phone'   => 'required|string',
            'otp'     => 'required|string|size:6',
            'country' => 'nullable|string|max:100',
        ]);

        $user = User::where('role', '!=', 'admin')
            ->whereIn('phone', $this->phoneVariants($request->phone))
            ->first();

        if (! $user || $user->otp !== $request->otp || now()->isAfter($user->otp_expires_at)) {
            throw ValidationException::withMessages([
                'otp' => ['Invalid or expired code. Please try again.'],
            ]);
        }

        if ($user->is_blocked) {
            throw ValidationException::withMessages([
                'otp' => ['Your account has been blocked. Please contact support.'],
            ]);
        }

        $update = ['otp' => null, 'otp_expires_at' => null];
        if ($request->filled('country')) {
            $update['country'] = $request->country;
        }
        $user->update($update);

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json(['user' => $user->fresh(), 'token' => $token]);
    }

    public function resendVerification(Request $request): JsonResponse
    {
        $request->validate(['email' => 'required|email']);

        $user = User::where('email', $request->email)->first();

        // Silent success if user not found — avoids email enumeration
        if (! $user || $user->email_verified_at) {
            return response()->json(['message' => 'If that email exists and is unverified, a new code has been sent.']);
        }

        $otp = (string) random_int(100000, 999999);
        $user->update(['otp' => $otp, 'otp_expires_at' => now()->addMinutes(10)]);
        Mail::to($user->email)->send(new OtpNotification($otp, $user->name));

        return response()->json(['message' => 'Verification code resent.']);
    }

    public function contact(Request $request): JsonResponse
    {
        $request->validate([
            'name'    => 'required|string|max:100',
            'email'   => 'required|email',
            'message' => 'required|string|max:2000',
        ]);

        Log::info('Contact form submission', [
            'name'    => $request->name,
            'email'   => $request->email,
            'message' => $request->message,
        ]);

        try {
            $to = config('mail.from.address');
            Mail::to(trim($to))->send(new ContactMessage(
                $request->name,
                $request->email,
                $request->message,
            ));
        } catch (\Throwable $e) {
            Log::error('Contact email failed: ' . $e->getMessage());
        }

        return response()->json(['message' => 'Your message has been sent.']);
    }

    public function forgotPassword(Request $request): JsonResponse
    {
        $request->validate(['email' => 'required|email']);

        $user = User::where('email', $request->email)->first();

        // Silent success — avoids email enumeration
        if (! $user || ! $user->email) {
            return response()->json(['message' => 'If that email is registered, a reset code has been sent.']);
        }

        $otp = (string) random_int(100000, 999999);
        $user->update(['otp' => $otp, 'otp_expires_at' => now()->addMinutes(15)]);

        Mail::to($user->email)->send(new OtpNotification($otp, $user->name));

        $masked = substr($user->email, 0, 2)
            . str_repeat('*', max(1, strpos($user->email, '@') - 2))
            . substr($user->email, strpos($user->email, '@'));

        return response()->json([
            'message'      => 'Reset code sent.',
            'masked_email' => $masked,
        ]);
    }

    public function resetPassword(Request $request): JsonResponse
    {
        $request->validate([
            'email'                 => 'required|email',
            'otp'                   => 'required|string|size:6',
            'password'              => 'required|string|min:8|confirmed',
        ]);

        $user = User::where('email', $request->email)->first();

        if (! $user || $user->otp !== $request->otp || now()->isAfter($user->otp_expires_at)) {
            throw ValidationException::withMessages([
                'otp' => ['Invalid or expired code. Please try again.'],
            ]);
        }

        $user->update([
            'password'       => $request->password,
            'otp'            => null,
            'otp_expires_at' => null,
        ]);

        return response()->json(['message' => 'Password reset successfully. You can now sign in.']);
    }

    private function phoneVariants(string $phone): array
    {
        $normalized = $this->normalizePhone($phone);         // 94XXXXXXXXX
        $local      = '0' . substr($normalized, 2);          // 0XXXXXXXXX
        return array_unique([$normalized, $local, '+' . $normalized, $phone]);
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

    public function sendListingOtp(Request $request): JsonResponse
    {
        $user = $request->user();
        $otp  = (string) random_int(100000, 999999);

        $user->update([
            'otp'            => $otp,
            'otp_expires_at' => now()->addMinutes(10),
        ]);

        Mail::to($user->email)->send(new OtpNotification($otp, $user->name));

        return response()->json([
            'message'      => 'Verification code sent to your email.',
            'masked_email' => $this->maskEmail($user->email),
        ]);
    }

    private function maskPhone(string $phone): string
    {
        $clean = preg_replace('/\D/', '', $phone);
        return substr($clean, 0, 3) . str_repeat('*', max(1, strlen($clean) - 4)) . substr($clean, -1);
    }

    private function maskEmail(string $email): string
    {
        [$local, $domain] = explode('@', $email);
        return substr($local, 0, 1) . str_repeat('*', max(1, strlen($local) - 1)) . '@' . $domain;
    }

    public function deleteAvatar(Request $request): JsonResponse
    {
        $user = $request->user();

        $oldPath = $user->getAttributes()['avatar'] ?? null;
        if ($oldPath && ! str_starts_with($oldPath, 'http')) {
            Storage::disk('public')->delete($oldPath);
        }

        $user->update(['avatar' => null]);

        return response()->json($user->fresh());
    }
}
