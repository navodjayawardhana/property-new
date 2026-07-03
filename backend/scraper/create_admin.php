<?php
require __DIR__ . '/../vendor/autoload.php';
$app = require __DIR__ . '/../bootstrap/app.php';
$app->make(\Illuminate\Contracts\Console\Kernel::class)->bootstrap();

$email = config('services.admin.email');
$password = config('services.admin.password');

if (! $email || ! $password) {
    fwrite(STDERR, "Set ADMIN_EMAIL and ADMIN_PASSWORD in .env first (run AdminSeeder).\n");
    exit(1);
}

$user = \App\Models\User::where('email', $email)->where('role', 'admin')->first();

if (! $user) {
    fwrite(STDERR, "No admin user found for {$email} — run `php artisan db:seed --class=AdminSeeder` first.\n");
    exit(1);
}

$token = $user->createToken('scraper')->plainTextToken;
echo $token . PHP_EOL;
