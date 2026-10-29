<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Password;

class AccountController extends Controller
{
    private const DEFAULT_PREFERENCES = [
        'default_reminder_intervals' => [1440, 60],
        'email_interview_reminders' => false,
        'email_deadline_reminders' => false,
        'email_follow_up_reminders' => false,
        'email_application_updates' => false,
    ];

    public function show(Request $request)
    {
        return response()->json(['user' => $this->userPayload($request->user())]);
    }

    public function update(Request $request)
    {
        $user = $request->user();
        $data = $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'email' => ['sometimes', 'required', 'email', 'max:255', Rule::unique('users', 'email')->ignore($user->id)],
            'timezone' => 'sometimes|required|timezone',
            'notification_preferences' => 'sometimes|required|array',
            'notification_preferences.default_reminder_intervals' => 'sometimes|array|max:3',
            'notification_preferences.default_reminder_intervals.*' => 'integer|in:1440,60,15',
            'notification_preferences.email_interview_reminders' => 'sometimes|boolean',
            'notification_preferences.email_deadline_reminders' => 'sometimes|boolean',
            'notification_preferences.email_follow_up_reminders' => 'sometimes|boolean',
            'notification_preferences.email_application_updates' => 'sometimes|boolean',
        ]);

        $emailChanged = isset($data['email']) && $data['email'] !== $user->email;
        $preferences = array_replace(
            self::DEFAULT_PREFERENCES,
            $user->notification_preferences ?? [],
            $data['notification_preferences'] ?? [],
        );
        if (isset($preferences['default_reminder_intervals'])) {
            $preferences['default_reminder_intervals'] = array_values(array_unique($preferences['default_reminder_intervals']));
        }

        $user->fill([
            ...array_intersect_key($data, array_flip(['name', 'email', 'timezone'])),
            'notification_preferences' => $preferences,
        ]);
        if ($emailChanged) {
            $user->email_verified_at = null;
        }
        $user->save();

        if ($emailChanged) {
            $user->sendEmailVerificationNotification();
        }

        return response()->json([
            'message' => $emailChanged
                ? 'Profile updated. Verify your new email address before using it for sign-in or notifications.'
                : 'Profile updated successfully.',
            'user' => $this->userPayload($user),
        ]);
    }

    public function changePassword(Request $request)
    {
        $data = $request->validate([
            'current_password' => 'required|string',
            'password' => ['required', 'confirmed', Password::min(8)],
        ]);
        $user = $request->user();

        if (!Hash::check($data['current_password'], $user->password)) {
            return response()->json(['message' => 'The current password is incorrect.'], 422);
        }

        $user->password = $data['password'];
        $user->save();

        $currentToken = $user->currentAccessToken();
        if ($currentToken && method_exists($currentToken, 'getKey')) {
            $user->tokens()->where('id', '!=', $currentToken->getKey())->delete();
        }

        return response()->json(['message' => 'Password changed successfully. Other active sessions have been signed out.']);
    }

    private function userPayload($user): array
    {
        return [
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'email_verified_at' => $user->email_verified_at,
            'timezone' => $user->timezone ?: 'UTC',
            'notification_preferences' => array_replace(
                self::DEFAULT_PREFERENCES,
                $user->notification_preferences ?? [],
            ),
        ];
    }
}
