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
    private const STUDENT_CLASSES = [
        'BSIT 1-A',
        'BSIT 1-B',
        'BSIT 2-A',
        'BSIT 2-B',
        'BIT2B',
        'BIT AE3',
        'BIT3AE',
    ];

    private const YEAR_LEVELS = [
        '1st Year',
        '2nd Year',
        '3rd Year',
        '4th Year',
    ];

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

        $students = User::query()
            ->where('role', 'student')
            ->orderBy('name')
            ->get(['id', 'name', 'email', 'phone', 'class_name', 'year_level']);

        $studentClasses = self::STUDENT_CLASSES;
        $yearLevels = self::YEAR_LEVELS;

        return view('admin.dashboard', compact('teachers', 'students', 'studentClasses', 'yearLevels'));
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

    public function updateStudentClass(Request $request, User $student): RedirectResponse
    {
        if (! Auth::check()) {
            return redirect('/portal')->with('admin_login_required', 'Please sign in with an administrator account.');
        }

        $this->requireAdmin();
        abort_unless($student->role === 'student', 404, 'Student account not found.');

        $data = $request->validate([
            'class_name' => ['required', 'string', 'in:' . implode(',', self::STUDENT_CLASSES)],
            'year_level' => ['required', 'string', 'in:' . implode(',', self::YEAR_LEVELS)],
        ]);

        $student->update($data);

        return redirect('/admin')->with('success', 'Class assignment updated for ' . $student->name . '.');
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
