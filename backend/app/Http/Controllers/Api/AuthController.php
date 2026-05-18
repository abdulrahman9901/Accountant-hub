<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api;

use App\Actions\Auth\LoginAction;
use App\Actions\Auth\LogoutAction;
use App\Actions\Auth\RegisterAction;
use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use App\Http\Requests\Auth\RegisterRequest;
use App\Http\Resources\UserResource;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AuthController extends Controller
{
    /**
     * Handle accountant registration.
     */
    public function register(RegisterRequest $request, RegisterAction $action): JsonResponse
    {
        $result = $action->execute($request->validated());

        return response()->json([
            'user' => new UserResource($result['user']),
            'token' => $result['token'],
        ], 201);
    }

    /**
     * Handle accountant login.
     */
    public function login(LoginRequest $request, LoginAction $action): JsonResponse
    {
        $result = $action->execute($request->validated());

        return response()->json([
            'user' => new UserResource($result['user']),
            'token' => $result['token'],
        ], 200);
    }

    /**
     * Handle accountant logout (revoke token).
     */
    public function logout(Request $request, LogoutAction $action): JsonResponse
    {
        $action->execute($request->user());

        return response()->json([
            'message' => 'Logged out successfully',
        ], 200);
    }

    /**
     * Retrieve the currently authenticated user.
     */
    public function user(Request $request): UserResource
    {
        return new UserResource($request->user());
    }
}
