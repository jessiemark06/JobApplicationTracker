<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\CompanyController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\ApplicationController;
use App\Http\Controllers\AdminUserController;
use App\Http\Controllers\CareerToolsController;
use App\Http\Controllers\AccountController;
use App\Http\Controllers\RecruitmentEventController;
use App\Http\Controllers\UserNotificationController;

Route::post('/register', [AuthController::class, 'register'])
        ->middleware('throttle:registration');

Route::post('/login', [AuthController::class, 'login'])
        ->middleware('throttle:auth');
Route::post('/email/verification-notification', [AuthController::class, 'resendVerification'])
        ->middleware('throttle:6,1');
Route::get('/email/verify/{id}/{hash}', [AuthController::class, 'verifyEmail'])
        ->middleware(['signed', 'throttle:6,1'])
        ->name('verification.verify');

Route::middleware('auth:sanctum')->group(function () {
        Route::get('/profile', [AccountController::class, 'show']);
        Route::put('/profile', [AccountController::class, 'update'])->middleware('throttle:10,1');
        Route::put('/profile/password', [AccountController::class, 'changePassword'])->middleware('throttle:5,1');
});

Route::middleware(['auth:sanctum', 'verified.api'])->group(function() {
        Route::get('/notifications', [UserNotificationController::class, 'index']);
        Route::get('/notifications/unread-count', [UserNotificationController::class, 'unreadCount']);
        Route::post('/notifications/read-all', [UserNotificationController::class, 'markAllRead']);
        Route::post('/notifications/{id}/read', [UserNotificationController::class, 'markRead']);
        Route::delete('/notifications/{id}', [UserNotificationController::class, 'destroy']);

        Route::get('/interviews', [RecruitmentEventController::class, 'index']);
        Route::post('/interviews', [RecruitmentEventController::class, 'store']);
        Route::get('/interviews/{id}', [RecruitmentEventController::class, 'show']);
        Route::put('/interviews/{id}', [RecruitmentEventController::class, 'update']);

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

        Route::get('/analytics', [CareerToolsController::class, 'analytics']);
        Route::get('/follow-ups', [CareerToolsController::class, 'followUps']);
        Route::post('/follow-ups', [CareerToolsController::class, 'storeFollowUp']);
        Route::put('/follow-ups/{id}', [CareerToolsController::class, 'updateFollowUp']);
        Route::post('/follow-ups/{id}/complete', [CareerToolsController::class, 'completeFollowUp']);

        Route::get('/skills', [CareerToolsController::class, 'skills']);
        Route::post('/skills', [CareerToolsController::class, 'storeSkill']);
        Route::put('/skills/{id}', [CareerToolsController::class, 'updateSkill']);
        Route::delete('/skills/{id}', [CareerToolsController::class, 'deleteSkill']);
        Route::get('/job-requirements', [CareerToolsController::class, 'requirements']);
        Route::post('/job-requirements', [CareerToolsController::class, 'storeRequirement']);
        Route::put('/job-requirements/{id}', [CareerToolsController::class, 'updateRequirement']);
        Route::delete('/job-requirements/{id}', [CareerToolsController::class, 'deleteRequirement']);

        Route::post('/applications/{applicationId}/documents', [CareerToolsController::class, 'uploadDocument']);
        Route::get('/documents/{id}/download', [CareerToolsController::class, 'downloadDocument']);
        Route::delete('/documents/{id}', [CareerToolsController::class, 'deleteDocument']);

        Route::post('/companies/{companyId}/research', [CareerToolsController::class, 'storeResearchEntry']);
        Route::put('/research/{id}', [CareerToolsController::class, 'updateResearchEntry']);
        Route::delete('/research/{id}', [CareerToolsController::class, 'deleteResearchEntry']);

});
