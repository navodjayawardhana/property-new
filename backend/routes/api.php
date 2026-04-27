<?php

use App\Http\Controllers\AdminController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\FavoriteController;
use App\Http\Controllers\InquiryController;
use App\Http\Controllers\LoanEnquiryController;
use App\Http\Controllers\NewsController;
use App\Http\Controllers\PaymentController;
use App\Http\Controllers\PropertyController;
use Illuminate\Support\Facades\Route;

// Public auth routes
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);
Route::post('/verify-otp', [AuthController::class, 'verifyOtp']);
Route::post('/verify-email', [AuthController::class, 'verifyEmail']);
Route::post('/resend-verification', [AuthController::class, 'resendVerification']);
Route::post('/phone-login', [AuthController::class, 'sendPhoneOtp']);
Route::post('/verify-phone-otp', [AuthController::class, 'verifyPhoneOtp']);
Route::post('/forgot-password', [AuthController::class, 'forgotPassword']);
Route::post('/reset-password', [AuthController::class, 'resetPassword']);
Route::post('/contact', [AuthController::class, 'contact']);

// Public property routes
Route::get('/properties', [PropertyController::class, 'index']);
Route::get('/properties/{property}', [PropertyController::class, 'show']);

// Public inquiry (guests can submit)
Route::post('/properties/{property}/inquiries', [InquiryController::class, 'store']);

// Public agents directory
Route::get('/agents', [AuthController::class, 'agents']);
Route::get('/agents/{id}', [AuthController::class, 'agent']);

// Public news
Route::get('/news', [NewsController::class, 'index']);
Route::get('/news/{newsArticle}', [NewsController::class, 'show']);

// Public loan pre-approval enquiry
Route::post('/loan-enquiries', [LoanEnquiryController::class, 'store']);

// PayHere server-to-server callback (no auth — called by PayHere servers)
Route::post('/payment/notify', [PaymentController::class, 'notify']);

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

    // Send OTP before creating a listing
    Route::post('/send-listing-otp', [AuthController::class, 'sendListingOtp']);

    // Payment — initiate checkout, complete on return, check status
    Route::post('/payment/initiate', [PaymentController::class, 'initiate']);
    Route::post('/payment/complete/{orderId}', [PaymentController::class, 'complete']);
    Route::get('/payment/status/{orderId}', [PaymentController::class, 'status']);

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

    // Favorites / saved properties
    Route::get('/favorites', [FavoriteController::class, 'index']);
    Route::get('/favorites/ids', [FavoriteController::class, 'ids']);
    Route::post('/favorites/{property}', [FavoriteController::class, 'toggle']);

    // Admin routes
    Route::prefix('admin')->group(function () {
        Route::get('/stats',                      [AdminController::class, 'stats']);
        Route::get('/users',                      [AdminController::class, 'users']);
        Route::patch('/users/{user}',             [AdminController::class, 'updateUser']);
        Route::delete('/users/{user}',            [AdminController::class, 'deleteUser']);
        Route::get('/properties',                 [AdminController::class, 'properties']);
        Route::patch('/properties/{property}',    [AdminController::class, 'updateProperty']);
        Route::delete('/properties/{property}',   [AdminController::class, 'deleteProperty']);
        Route::get('/inquiries',                  [AdminController::class, 'inquiries']);
        Route::patch('/inquiries/{inquiry}',      [AdminController::class, 'updateInquiry']);
        Route::delete('/inquiries/{inquiry}',     [AdminController::class, 'deleteInquiry']);

        // News management
        Route::get('/news',                       [NewsController::class, 'adminIndex']);
        Route::post('/news',                      [NewsController::class, 'store']);
        Route::patch('/news/{newsArticle}',       [NewsController::class, 'update']);
        Route::delete('/news/{newsArticle}',      [NewsController::class, 'destroy']);

        // Loan enquiry management
        Route::get('/loan-enquiries',                        [AdminController::class, 'loanEnquiries']);
        Route::patch('/loan-enquiries/{loanEnquiry}',        [AdminController::class, 'updateLoanEnquiry']);
        Route::delete('/loan-enquiries/{loanEnquiry}',       [AdminController::class, 'deleteLoanEnquiry']);
    });
});
