<?php

use App\Http\Controllers\AdminController;
use App\Http\Controllers\AdvertisementManagerController;
use App\Http\Controllers\AgentSlideController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\BankLoanRateController;
use App\Http\Controllers\ExternalStatsController;
use App\Http\Controllers\FavoriteController;
use App\Http\Controllers\SlideController;
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
Route::get('/agents/{slug}', [AuthController::class, 'agent']);
Route::get('/agents/{slug}/slides', [AgentSlideController::class, 'publicIndex']);

// Public news
Route::get('/news', [NewsController::class, 'index']);
Route::get('/news/{newsArticle}', [NewsController::class, 'show']);

// Public loan pre-approval enquiry
Route::post('/loan-enquiries', [LoanEnquiryController::class, 'store']);

// Public slides
Route::get('/slides', [SlideController::class, 'index']);

// Public bank loan rates
Route::get('/bank-loan-rates', [BankLoanRateController::class, 'index']);

// Public listing fee info
Route::get('/settings/public', [AdminController::class, 'publicSettings']);

// PayHere server-to-server callback (no auth — called by PayHere servers)
Route::post('/payment/notify', [PaymentController::class, 'notify']);

// Partner feed — read-only aggregates for external dashboards (Syncy Analytics).
// Server-to-server: authenticated by a shared key in X-Api-Key, not a session.
Route::middleware('partner')->prefix('external')->group(function () {
    Route::get('/stats', [ExternalStatsController::class, 'stats']);
});

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

    // Agent slideshow management (own slides)
    Route::get('/agent-slides',                      [AgentSlideController::class, 'index']);
    Route::post('/agent-slides',                     [AgentSlideController::class, 'store']);
    Route::patch('/agent-slides/{agentSlide}',       [AgentSlideController::class, 'update']);
    Route::delete('/agent-slides/{agentSlide}',      [AgentSlideController::class, 'destroy']);

    // Payment — initiate checkout, complete on return, receipt
    Route::post('/payment/initiate', [PaymentController::class, 'initiate']);
    Route::post('/payment/complete/{orderId}', [PaymentController::class, 'complete']);
    Route::get('/payment/status/{orderId}', [PaymentController::class, 'status']);
    Route::get('/payment/receipt/{orderId}', [PaymentController::class, 'receipt']);

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

    // Authenticated loan enquiry (stores user_id) + viewing own enquiries
    Route::post('/my-loan-enquiries', [LoanEnquiryController::class, 'storeAuth']);
    Route::get('/my-loan-enquiries',  [LoanEnquiryController::class, 'myEnquiries']);

    // Admin routes
    Route::prefix('admin')->group(function () {
        Route::get('/stats',                      [AdminController::class, 'stats']);
        Route::get('/users',                      [AdminController::class, 'users']);
        Route::patch('/users/{user}',             [AdminController::class, 'updateUser']);
        // Same handler over POST so the edit form can send multipart (avatar upload).
        Route::post('/users/{user}',              [AdminController::class, 'updateUser']);
        Route::delete('/users/{user}',            [AdminController::class, 'deleteUser']);
        Route::post('/users/{user}/toggle-block', [AdminController::class, 'toggleBlockUser']);
        Route::get('/properties',                 [AdminController::class, 'properties']);
        Route::post('/properties',                [AdminController::class, 'createProperty']);
        Route::post('/properties/create-for-seller', [AdminController::class, 'createListingForSeller']);
        Route::get('/advertisement-managers',     [AdminController::class, 'advertisementManagers']);
        Route::post('/advertisement-managers',    [AdminController::class, 'createAdvertisementManager']);
        Route::patch('/advertisement-managers/{user}', [AdminController::class, 'updateAdvertisementManager']);
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

        // Pricing settings
        Route::get('/settings',  [AdminController::class, 'getSettings']);
        Route::put('/settings',  [AdminController::class, 'updateSettings']);

        // Bank loan rates
        Route::get('/bank-loan-rates',                    [BankLoanRateController::class, 'adminIndex']);
        Route::post('/bank-loan-rates',                   [BankLoanRateController::class, 'store']);
        Route::put('/bank-loan-rates/{bankLoanRate}',     [BankLoanRateController::class, 'update']);
        Route::delete('/bank-loan-rates/{bankLoanRate}',  [BankLoanRateController::class, 'destroy']);

        // Slideshow
        Route::get('/slides',             [SlideController::class, 'adminIndex']);
        Route::post('/slides',            [SlideController::class, 'store']);
        Route::patch('/slides/{slide}',   [SlideController::class, 'update']);
        Route::delete('/slides/{slide}',  [SlideController::class, 'destroy']);
    });

    // Advertisement Manager portal
    Route::prefix('advertisement-manager')->group(function () {
        Route::get('/users',     [AdvertisementManagerController::class, 'searchUsers']);
        Route::get('/listings',  [AdvertisementManagerController::class, 'index']);
        Route::post('/listings', [AdvertisementManagerController::class, 'createListing']);
    });
});
