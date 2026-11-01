<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\User;
use Illuminate\Auth\Events\Verified;
use Illuminate\Support\Facades\Hash;
use App\Models\Agreement;
use Illuminate\Support\Facades\DB;

class AuthController extends Controller
{
    public function register(Request $request)
    {
        $data = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|min:8|confirmed',
            'agreement_slugs' => 'sometimes|array|min:1',
            'agreement_slugs.*' => 'string|distinct',
        ]);

        $requiredAgreements = Agreement::where('is_required', true)
            ->whereNotNull('published_at')
            ->where('published_at', '<=', now())
            ->get();
        $providedSlugs = collect($data['agreement_slugs'] ?? []);
        if ($providedSlugs->isNotEmpty() && $requiredAgreements->contains(fn ($agreement) => !$providedSlugs->contains($agreement->slug))) {
            return response()->json(['message' => 'You must accept all required agreements before registering.'], 422);
        }

        $user = DB::transaction(function () use ($data, $requiredAgreements, $providedSlugs, $request) {
            $user = User::create([
                'name' => $data['name'],
                'email' => $data['email'],
                'password' => Hash::make($data['password']),
            ]);
            foreach ($requiredAgreements->filter(fn ($agreement) => $providedSlugs->contains($agreement->slug)) as $agreement) {
                $user->userAgreements()->create([
                    'agreement_id' => $agreement->id,
                    'accepted_at' => now(),
                    'ip_address' => $request->ip(),
                    'user_agent' => $request->userAgent(),
                ]);
            }
            return $user;
        });

        $user->sendEmailVerificationNotification();

        return response()->json([
            'message' => 'Account created. Check your email for a verification link before signing in.',
        ], 201);
    }

    public function resendVerification(Request $request)
    {
        $request->validate(['email' => 'required|email']);

        $user = User::where('email', $request->email)->first();

        if ($user && !$user->hasVerifiedEmail()) {
            $user->sendEmailVerificationNotification();
        }

        return response()->json([
            'message' => 'If that email belongs to an unverified account, a new verification link has been sent.',
        ]);
    }

    public function verifyEmail(Request $request, int $id, string $hash)
    {
        $user = User::findOrFail($id);

        if (!hash_equals(sha1($user->getEmailForVerification()), $hash)) {
            abort(403, 'This verification link is invalid.');
        }

        if (!$user->hasVerifiedEmail()) {
            $user->markEmailAsVerified();
            event(new Verified($user));
        }

        return response()->view('auth.email-verified', [
            'loginUrl' => rtrim(config('app.frontend_url', 'http://localhost:5173'), '/').'/#/',
        ]);
    }

    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required'
        ]);

        $user = User::where('email', $request->email)->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            return response()->json([
                'message' => 'Invalid email or password'
            ], 401);
        }

        if (!$user->hasVerifiedEmail()) {
            return response()->json([
                'message' => 'Please verify your email address before signing in.',
                'email_verified' => false,
            ], 403);
        }

        $user->tokens()->delete();
        $token = $user->createToken('jobtrack-token')->plainTextToken;

        return response()->json([
            'message' => 'Login successful',
            'user' => $user,
            'token' => $token
        ], 200);
    }

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'message' => 'Logout successful'
        ], 200);
    }
}