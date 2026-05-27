<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Laravel\Socialite\Facades\Socialite;

class SocialAuthController extends Controller
{
    private const ALLOWED_ROLES = ['buyer', 'seller', 'agent', 'admin'];

    public function redirectToGoogle(Request $request): RedirectResponse
    {
        $role = in_array($request->role, self::ALLOWED_ROLES) ? $request->role : 'buyer';
        session(['google_role' => $role]);

        return Socialite::driver('google')->redirect();
    }

    public function handleGoogleCallback(): RedirectResponse
    {
        $frontend = config('app.frontend_url', 'http://localhost:3000');

        try {
            $googleUser = Socialite::driver('google')->user();
        } catch (\Throwable) {
            return redirect("{$frontend}/signin?error=google_failed");
        }

        $role = session()->pull('google_role', 'buyer');

        $existing = User::where('email', $googleUser->getEmail())->first();

        if ($existing) {
            // Existing user: keep their current role, just sync avatar
            if ($googleUser->getAvatar() && str_starts_with($existing->getRawOriginal('avatar') ?? '', 'http')) {
                $existing->update(['avatar' => $googleUser->getAvatar()]);
            }
            $user = $existing;
        } else {
            // New user: assign the role chosen on the login page
            $user = User::create([
                'name'              => $googleUser->getName(),
                'email'             => $googleUser->getEmail(),
                'password'          => str()->random(32),
                'avatar'            => $googleUser->getAvatar(),
                'role'              => $role,
                'email_verified_at' => now(),
            ]);
        }

        $token = $user->createToken('google_token')->plainTextToken;

        return redirect("{$frontend}/auth/callback?token={$token}");
    }
}
