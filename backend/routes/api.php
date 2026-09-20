<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\CompanyController;
use App\Http\Controllers\AuthController;

Route::post('/register', [AuthController::class, 'register']);

Route::post('/login', [AuthController::class, 'login']);

Route::middleware('auth:sanctum')->group(function() {

        Route::get('/companies', [CompanyController::class, 'index']);

        Route::post('/companies', [CompanyController::class, 'store']);

        Route::get('/companies/edit/{id}', [CompanyController::class, 'show']);

        Route::put('/companies/update/{id}', [CompanyController::class, 'update']);

        Route::delete('/companies/delete/{id}', [CompanyController::class, 'delete']);

        Route::post('/logout', [AuthController::class, 'logout']);

});

