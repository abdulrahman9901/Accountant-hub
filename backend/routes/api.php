<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\JobCategoryController;
use App\Http\Controllers\Api\JobController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Accountant Hub API Routes
|--------------------------------------------------------------------------
| Endpoints are implemented incrementally — see backend/docs/api.md
|
*/

Route::get('/health', fn () => response()->json(['status' => 'ok']));

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);
Route::get('/categories', [JobCategoryController::class, 'index']);
Route::get('/jobs', [JobController::class, 'index']);

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', [AuthController::class, 'user']);
});
