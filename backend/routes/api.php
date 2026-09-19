<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\CompanyController;
use App\Http\Controllers\AuthController;

Route::post('/register', [AuthController::class, 'register']);

Route::get('/companies', [CompanyController::class, 'index']);

Route::post('/companies', [CompanyController::class, 'store']);

Route::get('/companies/edit/{id}', [CompanyController::class, 'show']);

Route::put('/companies/update/{id}', [CompanyController::class, 'update']);

Route::delete('/companies/delete/{id}', [CompanyController::class, 'delete']);