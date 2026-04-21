<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\InquiryController;
use App\Http\Controllers\PropertyController;
use Illuminate\Support\Facades\Route;

// Public auth routes
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

// Public property routes
Route::get('/properties', [PropertyController::class, 'index']);
Route::get('/properties/{property}', [PropertyController::class, 'show']);

// Public inquiry (guests can submit)
Route::post('/properties/{property}/inquiries', [InquiryController::class, 'store']);

// Public agents directory
Route::get('/agents', [AuthController::class, 'agents']);

// Protected routes
Route::middleware('auth:sanctum')->group(function () {
    // Auth
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);

    // Profile management
    Route::patch('/profile', [AuthController::class, 'updateProfile']);
    Route::put('/profile/password', [AuthController::class, 'updatePassword']);
    Route::post('/profile/avatar', [AuthController::class, 'uploadAvatar']);
    Route::delete('/profile/avatar', [AuthController::class, 'deleteAvatar']);

    // Property management
    Route::post('/properties', [PropertyController::class, 'store']);
    Route::put('/properties/{property}', [PropertyController::class, 'update']);
    Route::patch('/properties/{property}', [PropertyController::class, 'update']);
    Route::delete('/properties/{property}', [PropertyController::class, 'destroy']);

    // Image management
    Route::post('/properties/{property}/images', [PropertyController::class, 'uploadImages']);
    Route::delete('/properties/{property}/images/{image}', [PropertyController::class, 'deleteImage']);

    // My listings
    Route::get('/my-properties', [PropertyController::class, 'myProperties']);

    // Inquiry management
    Route::get('/properties/{property}/inquiries', [InquiryController::class, 'index']);
    Route::get('/my-inquiries', [InquiryController::class, 'myInquiries']);
    Route::get('/received-inquiries', [InquiryController::class, 'receivedInquiries']);
});
