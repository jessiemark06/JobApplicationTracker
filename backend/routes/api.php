<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\CompanyController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\ApplicationController;
use App\Http\Controllers\AdminUserController;

Route::post('/register', [AuthController::class, 'register']);

Route::post('/login', [AuthController::class, 'login']);
Route::post('/email/verification-notification', [AuthController::class, 'resendVerification'])
        ->middleware('throttle:6,1');
Route::get('/email/verify/{id}/{hash}', [AuthController::class, 'verifyEmail'])
        ->middleware(['signed', 'throttle:6,1'])
        ->name('verification.verify');

Route::middleware(['auth:sanctum', 'verified.api'])->group(function() {

        Route::middleware('admin')->prefix('admin')->group(function () {
                Route::get('/users', [AdminUserController::class, 'index']);
                Route::put('/users/{user}', [AdminUserController::class, 'update']);
                Route::delete('/users/{user}', [AdminUserController::class, 'destroy']);
        });

        Route::get('/companies', [CompanyController::class, 'index']);

        Route::post('/companies', [CompanyController::class, 'store']);

        Route::get('/companies/edit/{id}', [CompanyController::class, 'show']);

        Route::put('/companies/update/{id}', [CompanyController::class, 'update']);

        Route::delete('/companies/delete/{id}', [CompanyController::class, 'delete']);

        Route::post('/logout', [AuthController::class, 'logout']);

        // Applications
        Route::get('/applications', [ApplicationController::class, 'index']);
       
        Route::post('/applications', [ApplicationController::class, 'store']);
        
        Route::get('/applications/{id}', [ApplicationController::class, 'show']);
       
        Route::put('/applications/{id}', [ApplicationController::class, 'update']);
       
        Route::delete('/applications/{id}', [ApplicationController::class, 'destroy']);

});

