<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureEmailIsVerified
{
    public function handle(Request $request, Closure $next): Response
    {
        if (!$request->user()?->hasVerifiedEmail()) {
            return response()->json([
                'message' => 'Please verify your email address before continuing.',
                'email_verified' => false,
            ], 403);
        }

        return $next($request);
    }
}