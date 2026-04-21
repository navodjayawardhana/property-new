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

// Protected routes
Route::middleware('auth:sanctum')->group(function () {
    // Auth
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);

    // Property management
    Route::post('/properties', [PropertyController::class, 'store']);
    Route::put('/properties/{property}', [PropertyController::class, 'update']);
    Route::patch('/properties/{property}', [PropertyController::class, 'update']);
    Route::delete('/properties/{property}', [PropertyController::class, 'destroy']);

    // Image management
    Route::post('/properties/{property}/images', [PropertyController::class, 'uploadImages']);
    Route::delete('/properties/{property}/images/{image}', [PropertyController::class, 'deleteImage']);

    // Inquiry management
    Route::get('/properties/{property}/inquiries', [InquiryController::class, 'index']);
    Route::get('/my-inquiries', [InquiryController::class, 'myInquiries']);
});
