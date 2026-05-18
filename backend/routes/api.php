<?php

use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Accountant Hub API Routes
|--------------------------------------------------------------------------
| Endpoints are implemented incrementally — see backend/docs/api.md
*/

Route::get('/health', fn () => response()->json(['status' => 'ok']));
