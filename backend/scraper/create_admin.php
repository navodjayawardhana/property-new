<?php
require __DIR__ . '/../vendor/autoload.php';
$app = require __DIR__ . '/../bootstrap/app.php';
$app->make(\Illuminate\Contracts\Console\Kernel::class)->bootstrap();

$user = \App\Models\User::firstOrCreate(
    ['email' => 'admin@greenbrick.net'],
    [
        'name'     => 'Admin',
        'password' => bcrypt('Admin@1234'),
        'role'     => 'admin',
    ]
);

$user->role = 'admin';
$user->save();

$token = $user->createToken('scraper')->plainTextToken;
echo $token . PHP_EOL;
