<?php

namespace App\Http\Middleware;

use Illuminate\Auth\Middleware\Authenticate as Middleware;
use Illuminate\Http\Request;
use Illuminate\Auth\AuthenticationException;

class Authenticate extends Middleware
{
    /**
     * Get the path the user should be redirected to when they are not authenticated.
     */
    protected function redirectTo(Request $request): ?string
    {
        // Không redirect, luôn trả về lỗi 401
        return null;
    }

    // Ghi đè để luôn trả về JSON
    protected function unauthenticated($request, array $guards)
    {
        abort(response()->json([
            'message' => 'Vui lòng đăng nhập để truy cập vào trang này.'
        ], 401));
    }
}
