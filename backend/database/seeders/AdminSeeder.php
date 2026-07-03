<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class AdminSeeder extends Seeder
{
    /**
     * Seed the initial admin user from ADMIN_EMAIL / ADMIN_PASSWORD env vars.
     * Skips silently if either is unset, so this stays safe inside DatabaseSeeder
     * for environments (local/CI) that don't define an admin account.
     */
    public function run(): void
    {
        $email = config('services.admin.email');
        $password = config('services.admin.password');

        if (! $email || ! $password) {
            $this->command?->warn('ADMIN_EMAIL / ADMIN_PASSWORD not set — skipping admin seed.');
            return;
        }

        $admin = User::updateOrCreate(
            ['email' => $email],
            [
                'name'              => 'Site Admin',
                'password'          => $password,
                'role'              => 'admin',
                'email_verified_at' => now(),
            ]
        );

        $admin->update(['slug' => $admin->slug ?? Str::slug($admin->name) . '-' . $admin->id]);
    }
}
