<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\CartController;
use App\Http\Controllers\OrderController;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\VnPayController;
use App\Http\Controllers\MomoController;
use App\Http\Controllers\LocationController;
use App\Http\Controllers\PaymentConfigController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/

Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user();
});

// Public routes
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

// VNPay callback routes (no auth required)
Route::get('/vnpay/return', [VnPayController::class, 'returnUrl']);
Route::get('/vnpay/notify', [VnPayController::class, 'notify']);
Route::post('/momo/ipn', [MomoController::class, 'ipn']);


// Location routes
Route::get('/locations/provinces', [LocationController::class, 'provinces']);
Route::get('/locations/provinces/{provinceCode}/districts', [LocationController::class, 'districts']);
Route::get('/payment-config/public', [PaymentConfigController::class, 'publicConfig']);

// Product routes
Route::get('/products', [ProductController::class, 'index']);
Route::get('/products/{id}', [ProductController::class, 'show']);
Route::get('/categories', [ProductController::class, 'getCategories']);

// Protected routes
Route::middleware('auth:sanctum')->group(function () {
    
    Route::post('/user/update', [AuthController::class, 'updateProfile']);
    Route::get('/user', function (Request $request) {
        return $request->user();
    });
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);
    Route::get('/cart', [CartController::class, 'index']);
    Route::post('/cart/add', [CartController::class, 'add']);
    Route::post('/cart/update', [CartController::class, 'update']);
    Route::post('/cart/remove', [CartController::class, 'remove']);
    Route::post('/checkout', [OrderController::class, 'checkout']);
    Route::post('/vnpay/checkout', [VnPayController::class, 'checkout']);
    Route::post('/momo/checkout', [MomoController::class, 'checkout']);
    Route::get('/orders', [OrderController::class, 'list']);
    Route::post('/products', [ProductController::class, 'store']);
    Route::put('/products/{id}', [ProductController::class, 'update']);
    Route::delete('/products/{id}', [ProductController::class, 'destroy']);
    Route::post('/categories', [CategoryController::class, 'store']);
    Route::put('/categories/{id}', [CategoryController::class, 'update']);
    Route::delete('/categories/{id}', [CategoryController::class, 'destroy']);
    Route::post('/review', [ProductController::class, 'review']);

});

// Admin routes
Route::middleware(['auth:sanctum', 'admin'])->prefix('admin')->group(function () {
    // ... existing admin routes ...
    
    // Order management routes
    Route::get('/orders', [App\Http\Controllers\Admin\OrderController::class, 'index']);
    Route::get('/orders/all', [App\Http\Controllers\Admin\OrderController::class, 'getAll']);
    Route::get('/orders/{id}', [App\Http\Controllers\Admin\OrderController::class, 'show']);
    Route::put('/orders/{id}/status', [App\Http\Controllers\Admin\OrderController::class, 'updateStatus']);
    Route::put('/orders/{id}/cancel', [App\Http\Controllers\Admin\OrderController::class, 'cancel']);

    // Payment config routes
    Route::get('/payment-config', [App\Http\Controllers\Admin\PaymentConfigController::class, 'show']);
    Route::put('/payment-config', [App\Http\Controllers\Admin\PaymentConfigController::class, 'update']);

    // User management routes
    Route::get('/users', [App\Http\Controllers\Admin\UserController::class, 'index']);
    Route::get('/users/{id}', [App\Http\Controllers\Admin\UserController::class, 'show']);
    Route::put('/users/{id}', [App\Http\Controllers\Admin\UserController::class, 'update']);
    Route::delete('/users/{id}', [App\Http\Controllers\Admin\UserController::class, 'destroy']);
});

// Admin Dashboard Routes
Route::middleware(['auth:sanctum', 'admin'])->prefix('admin/dashboard')->group(function () {
    Route::get('/stats', [App\Http\Controllers\Admin\DashboardController::class, 'getStats']);
    Route::get('/revenue', [App\Http\Controllers\Admin\DashboardController::class, 'getRevenue']);
    Route::get('/analytics', [App\Http\Controllers\Admin\DashboardController::class, 'getAnalytics']);
    Route::get('/latest-orders', [App\Http\Controllers\Admin\DashboardController::class, 'getLatestOrders']);
});
