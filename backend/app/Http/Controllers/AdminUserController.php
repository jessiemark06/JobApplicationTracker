<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class AdminUserController extends Controller
{
    public function index()
    {
        return response()->json([
            'users' => User::query()->orderBy('id')->get(['id', 'name', 'email', 'created_at']),
        ]);
    }

    public function update(Request $request, User $user)
    {
        if ($user->is($request->user())) {
            return response()->json(['message' => 'You cannot edit the administrator account here.'], 422);
        }

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255', Rule::unique('users')->ignore($user->id)],
        ]);

        $user->update($validated);

        return response()->json([
            'message' => 'User updated successfully.',
            'user' => $user->only(['id', 'name', 'email', 'created_at']),
        ]);
    }

    public function destroy(Request $request, User $user)
    {
        if ($user->is($request->user())) {
            return response()->json(['message' => 'You cannot delete the administrator account.'], 422);
        }

        $user->delete();

        return response()->json(['message' => 'User deleted successfully.']);
    }
}