<?php

namespace App\Services;

use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\ValidationException;

class AvatarService
{
    public function update(User $user, ?UploadedFile $file, array $attributes = []): void
    {
        $oldPath = $user->getRawOriginal('avatar');
        try {
            $path = $file ? $file->store('avatars', 'public') : null;
        } catch (\Throwable $error) {
            report($error);
            throw ValidationException::withMessages(['avatar' => ['Image could not be stored. Please try again.']]);
        }
        if ($file && ! $path) {
            throw ValidationException::withMessages(['avatar' => ['Image could not be stored. Please try again.']]);
        }
        try {
            $user->update(array_merge($attributes, ['avatar' => $path]));
        } catch (\Throwable $error) {
            if ($path) {
                Storage::disk('public')->delete($path);
            }
            throw $error;
        }
        if ($oldPath && str_starts_with($oldPath, 'avatars/') && ! User::where('avatar', $oldPath)->exists()) {
            Storage::disk('public')->delete($oldPath);
        }
    }
}
