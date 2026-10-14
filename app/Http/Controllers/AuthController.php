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
    // Normalize the login input before validating it.
    $username = trim((string) $request->input('username', ''));

    $request->merge([
        'username' => $username,
    ]);

    $data = $request->validate([
        'username' => ['required', 'string', 'max:255'],
        'password' => ['required', 'string', 'max:255'],
        'role' => ['required', 'in:student,teacher,guest,admin'],
    ]);

    $username = $data['username'];

    // Match emails without case sensitivity; keep phone matching exact
    // apart from leading and trailing spaces.
    $user = User::query()
        ->where('email', mb_strtolower($username))
        ->orWhere('phone', $username)
        ->first();

    if (
        ! $user ||
        ! Hash::check($data['password'], $user->password) ||
        $user->role !== $data['role']
    ) {
        throw ValidationException::withMessages([
            'username' => [
                'Login failed. Check your email or phone, password, and selected account role.',
            ],
        ]);
    }

    Auth::login($user);
    $request->session()->regenerate();

    return response()->json([
        'user' => self::publicUser($user),
    ]);
}

public function register(Request $request): JsonResponse
{
    // Normalize account details before checking for duplicates.
    $request->merge([
        'name' => trim((string) $request->input('name', '')),
        'email' => mb_strtolower(trim((string) $request->input('email', ''))),
        'phone' => trim((string) $request->input('phone', '')),
    ]);

    $data = $request->validate([
        'name' => ['required', 'string', 'max:120'],
        'email' => [
            'required',
            'string',
            'email',
            'max:255',
            'unique:users,email',
        ],
        'phone' => [
            'required',
            'string',
            'max:30',
            'unique:users,phone',
        ],
        'password' => ['required', 'confirmed', Password::min(8)],
    ], [
        'email.unique' => 'This email address is already registered. Please log in or use another email.',
        'phone.unique' => 'This phone number is already registered. Please log in or use another phone number.',
        'password.confirmed' => 'The password confirmation does not match.',
    ]);

    // Public registration always creates a student account.
    // Teacher and admin accounts must be created by an administrator.
    $user = User::create([
        'name' => $data['name'],
        'email' => $data['email'],
        'phone' => $data['phone'],
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
            'profile_picture_url' => $user->profile_picture
                ? Storage::disk('public')->url($user->profile_picture)
                : null,
        ];
    }
}
