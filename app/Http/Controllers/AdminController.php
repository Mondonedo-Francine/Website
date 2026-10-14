<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\View\View;
use Illuminate\Validation\Rules\Password;

class AdminController extends Controller
{
    private function requireAdmin(): void
    {
        abort_unless(Auth::check() && Auth::user()->role === 'admin', 403, 'Administrator access required.');
    }

    public function index(): View|RedirectResponse
    {
        if (! Auth::check()) {
            return redirect('/portal')->with('admin_login_required', 'Please sign in with an administrator account.');
        }

        $this->requireAdmin();

        $teachers = User::query()
            ->where('role', 'teacher')
            ->orderBy('name')
            ->get(['id', 'name', 'email', 'phone', 'created_at']);

        return view('admin.dashboard', compact('teachers'));
    }

    public function storeTeacher(Request $request): RedirectResponse
    {
        if (! Auth::check()) {
            return redirect('/portal')->with('admin_login_required', 'Please sign in with an administrator account.');
        }

        $this->requireAdmin();

        $data = $request->validate([
            'name' => ['required', 'string', 'max:120'],
            'email' => ['required', 'string', 'email', 'max:255', 'unique:users,email'],
            'phone' => ['required', 'string', 'max:30', 'unique:users,phone'],
            'password' => ['required', 'confirmed', Password::min(8)],
        ]);

        User::create([
            'name' => trim($data['name']),
            'email' => mb_strtolower(trim($data['email'])),
            'phone' => trim($data['phone']),
            'password' => $data['password'],
            'role' => 'teacher',
        ]);

        return redirect('/admin')->with('success', 'Teacher account created successfully.');
    }

    public function logout(Request $request): RedirectResponse
    {
        $this->requireAdmin();

        Auth::logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect('/portal');
    }
}
