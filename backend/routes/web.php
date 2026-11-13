<?php

use App\Http\Controllers\SocialAuthController;
use Illuminate\Support\Facades\Route;

Route::get('/email/unsubscribe/{token}', [\App\Http\Controllers\MarketingPreferenceController::class, 'confirm'])->middleware('throttle:30,1')->name('marketing.unsubscribe');
Route::post('/email/unsubscribe/{token}', [\App\Http\Controllers\MarketingPreferenceController::class, 'unsubscribe'])->middleware('throttle:30,1');

Route::get('/', function () {
    return view('welcome');
});

Route::get('/auth/google/redirect', [SocialAuthController::class, 'redirectToGoogle']);
Route::get('/auth/google/callback', [SocialAuthController::class, 'handleGoogleCallback']);
