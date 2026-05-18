<?php

declare(strict_types=1);

namespace App\Actions\Auth;

use App\Models\User;

readonly class LogoutAction
{
    /**
     * Revoke the current user's access token.
     */
    public function execute(User $user): void
    {
        $user->currentAccessToken()->delete();
    }
}
