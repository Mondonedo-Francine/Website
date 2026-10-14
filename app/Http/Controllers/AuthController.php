<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules\Password;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    public function login(Request $request): JsonResponse
    {
        $data = $request->validate([
            'username' => ['required', 'string', 'max:255'],
            'password' => ['required', 'string', 'max:255'],
            'role' => ['required', 'in:student,teacher,guest'],
        ]);

        $username = trim($data['username']);
        $user = User::query()
            ->where('email', mb_strtolower($username))
            ->orWhere('phone', $username)
            ->first();

        if (! $user || ! Hash::check($data['password'], $user->password) || $user->role !== $data['role']) {
            throw ValidationException::withMessages([
                'username' => ['The supplied login details are incorrect.'],
            ]);
        }

        Auth::login($user);
        $request->session()->regenerate();

        return response()->json(['user' => self::publicUser($user)]);
    }

    public function register(Request $request): JsonResponse
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:120'],
            'email' => ['required', 'string', 'email', 'max:255', 'unique:users,email'],
            'phone' => ['required', 'string', 'max:30', 'unique:users,phone'],
            'password' => ['required', 'confirmed', Password::min(8)],
        ]);

        // Public registration always creates a student. Teacher accounts must be
        // created by a trusted administrator and cannot be self-assigned here.
        $user = User::create([
            'name' => trim($data['name']),
            'email' => mb_strtolower($data['email']),
            'phone' => trim($data['phone']),
            'password' => $data['password'],
            'role' => 'student',
        ]);

        return response()->json([
            'message' => 'Student account created successfully.',
            'user' => self::publicUser($user),
        ], 201);
    }

    public function logout(Request $request): JsonResponse
    {
        Auth::logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return response()->json(['message' => 'Logged out successfully.']);
    }

    public static function publicUser(User $user): array
    {
        return [
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'phone' => $user->phone,
            'role' => $user->role,
            'class_name' => $user->class_name,
        ];
    }
}
