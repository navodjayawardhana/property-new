<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    // Hardcoded admin credentials — change these before going to production
    private const ADMIN_EMAIL    = 'admin@greenbrick.net';
    private const ADMIN_PASSWORD = 'Admin@1234';

    public function register(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name'     => 'required|string|max:255',
            'email'    => 'required|email|unique:users,email',
            'password' => 'required|string|min:8|confirmed',
            'phone'    => 'nullable|string|max:20',
            'role'     => 'nullable|in:buyer,seller,agent',
        ]);

        $user = User::create([
            'name'     => $validated['name'],
            'email'    => $validated['email'],
            'password' => $validated['password'],
            'phone'    => $validated['phone'] ?? null,
            'role'     => $validated['role'] ?? 'buyer',
        ]);

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json(['user' => $user, 'token' => $token], 201);
    }

    public function login(Request $request): JsonResponse
    {
        $request->validate([
            'email'    => 'required|email',
            'password' => 'required|string',
        ]);

        // Hardcoded admin login — always works regardless of database state
        if ($request->email === self::ADMIN_EMAIL && $request->password === self::ADMIN_PASSWORD) {
            $admin = User::firstOrCreate(
                ['email' => self::ADMIN_EMAIL],
                [
                    'name'     => 'Site Admin',
                    'password' => self::ADMIN_PASSWORD,
                    'role'     => 'admin',
                ]
            );

            if ($admin->role !== 'admin') {
                $admin->update(['role' => 'admin']);
            }

            $token = $admin->createToken('admin_token')->plainTextToken;

            return response()->json(['user' => $admin->fresh(), 'token' => $token]);
        }

        if (! Auth::attempt($request->only('email', 'password'))) {
            throw ValidationException::withMessages([
                'email' => ['The provided credentials are incorrect.'],
            ]);
        }

        $user  = Auth::user();
        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json(['user' => $user, 'token' => $token]);
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
            'name'     => 'sometimes|string|max:255',
            'email'    => 'sometimes|email|unique:users,email,' . $user->id,
            'phone'    => 'nullable|string|max:20',
            'suburb'   => 'nullable|string|max:100',
            'state'    => 'nullable|string|max:10',
            'postcode' => 'nullable|string|max:10',
            'country'  => 'nullable|string|max:60',
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

    public function agents(Request $request): JsonResponse
    {
        $query = User::where('role', 'agent')->orderBy('name');

        if ($request->filled('suburb')) {
            $query->where('suburb', 'like', '%' . $request->suburb . '%');
        }
        if ($request->filled('state')) {
            $query->where('state', $request->state);
        }
        if ($request->filled('search')) {
            $query->where('name', 'like', '%' . $request->search . '%');
        }

        $agents = $query->select(['id', 'name', 'email', 'phone', 'avatar', 'suburb', 'state', 'postcode', 'country'])
            ->paginate(24);

        return response()->json($agents);
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
