<?php

namespace App\Http\Controllers;

use App\Models\AttendanceRecord;
use App\Models\HomeworkSubmission;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class PortalDataController extends Controller
{
    private const CLASSES = [
    'BSIT 1-A' => ['Althea Cruz', 'Joshua Garcia', 'Mika Santos', 'Nathan Reyes', 'Sofia Flores'],
    'BSIT 1-B' => ['Andrea Ramos', 'Daniel Torres', 'Ella Mendoza', 'Gabriel Lim', 'Isabelle Tan'],
    'BSIT 2-A' => ['Alyssa Dizon', 'Brandon Lee', 'Chloe Rivera', 'Dylan Bautista', 'Faith Navarro'],
    'BSIT 2-B' => ['Angela Villanueva', 'Christian Flores', 'Danica Reyes', 'Ethan Mendoza', 'Jasmine Cruz', 'Kyle Santos', 'Lance Garcia', 'Mia Torres'],
    'BIT2B' => [],
];

    private function requireRole(Request $request, string $role): void
    {
        abort_unless($request->user() && $request->user()->role === $role, 403, 'You are not allowed to perform this action.');
    }

    private function roster(string $className): array
    {
        abort_unless(isset(self::CLASSES[$className]), 404, 'Class not found.');

        return User::query()
            ->where('role', 'student')
            ->where('class_name', $className)
            ->orderBy('name')
            ->get(['id', 'name'])
            ->map(fn (User $student) => [
                'student_code' => 'LLCC-STU-' . $student->id,
                'student_name' => $student->name,
            ])
            ->all();
    }

    public function teacherDashboardStats(Request $request): JsonResponse
    {
        $this->requireRole($request, 'teacher');

        return response()->json([
            'students_across_classes' => User::query()
                ->where('role', 'student')
                ->whereNotNull('class_name')
                ->where('class_name', '<>', '')
                ->count(),
        ]);
    }

    public function attendanceClasses(Request $request): JsonResponse
    {
        $this->requireRole($request, 'teacher');

        $classes = [];
        foreach (array_keys(self::CLASSES) as $className) {
            $classes[] = ['class_name' => $className, 'students' => $this->roster($className)];
        }

        return response()->json(['classes' => $classes]);
    }

    public function attendance(Request $request): JsonResponse
    {
        $this->requireRole($request, 'teacher');
        $data = $request->validate([
            'class_name' => ['required', 'string', 'in:' . implode(',', array_keys(self::CLASSES))],
            'date' => ['required', 'date_format:Y-m-d'],
        ]);

        $rows = AttendanceRecord::query()
            ->where('class_name', $data['class_name'])
            ->whereDate('attendance_date', $data['date'])
            ->get()
            ->keyBy('student_code');

        $records = collect($this->roster($data['class_name']))->map(function (array $student) use ($rows) {
            return [
                ...$student,
                'status' => $rows->get($student['student_code'])?->status ?? 'Present',
            ];
        })->all();

        $history = AttendanceRecord::query()
            ->where('class_name', $data['class_name'])
            ->select('attendance_date', DB::raw('MAX(updated_at) as saved_at'))
            ->groupBy('attendance_date')
            ->orderByDesc('attendance_date')
            ->limit(8)
            ->get()
            ->map(fn ($item) => [
                'date' => $item->attendance_date,
                'saved_at' => $item->saved_at,
            ])->all();

        $savedAt = AttendanceRecord::query()
            ->where('class_name', $data['class_name'])
            ->whereDate('attendance_date', $data['date'])
            ->max('updated_at');

        return response()->json([
            'class_name' => $data['class_name'],
            'date' => $data['date'],
            'records' => $records,
            'history' => $history,
            'saved_at' => $savedAt,
        ]);
    }

    public function studentAttendance(Request $request): JsonResponse
    {
        $user = $request->user();
        abort_unless($user && $user->role === 'student', 403, 'Only student accounts can view student attendance.');

        $records = collect();
        if ($user->class_name) {
            $studentCode = 'LLCC-STU-' . $user->id;
            $records = AttendanceRecord::query()
                ->where('class_name', $user->class_name)
                ->where('student_code', $studentCode)
                ->orderByDesc('attendance_date')
                ->get(['attendance_date', 'class_name', 'status']);
        }

        $present = $records->where('status', 'Present')->count();
        $absent = $records->where('status', 'Absent')->count();
        $total = $records->count();

        return response()->json([
            'summary' => [
                'present_days' => $present,
                'absent_days' => $absent,
                'total_classes' => $total,
                'percentage' => $total > 0 ? round(($present / $total) * 100) : 0,
            ],
            'records' => $records->map(fn ($record) => [
                'date' => $record->attendance_date->format('Y-m-d'),
                'class_name' => $record->class_name,
                'status' => $record->status,
            ])->values(),
        ]);
    }

    public function saveAttendance(Request $request): JsonResponse
    {
        $this->requireRole($request, 'teacher');
        $data = $request->validate([
            'class_name' => ['required', 'string', 'in:' . implode(',', array_keys(self::CLASSES))],
            'date' => ['required', 'date_format:Y-m-d'],
            'records' => ['required', 'array', 'min:1'],
            'records.*.student_code' => ['required', 'string', 'max:40'],
            'records.*.status' => ['required', 'in:Present,Absent,Late,Excused'],
        ]);

        $roster = collect($this->roster($data['class_name']))->keyBy('student_code');
        $seen = [];
        foreach ($data['records'] as $record) {
            if (! $roster->has($record['student_code']) || isset($seen[$record['student_code']])) {
                throw ValidationException::withMessages([
                    'records' => ['The attendance list contains an unknown or duplicate student.'],
                ]);
            }
            $seen[$record['student_code']] = true;
        }

        if (count($seen) !== $roster->count()) {
            throw ValidationException::withMessages([
                'records' => ['Please submit attendance for every student in the selected class.'],
            ]);
        }

        DB::transaction(function () use ($data, $roster, $request) {
            foreach ($data['records'] as $record) {
                $student = $roster->get($record['student_code']);
                AttendanceRecord::query()->updateOrCreate(
                    [
                        'class_name' => $data['class_name'],
                        'attendance_date' => $data['date'],
                        'student_code' => $student['student_code'],
                    ],
                    [
                        'student_name' => $student['student_name'],
                        'status' => $record['status'],
                        'recorded_by' => $request->user()->id,
                    ]
                );
            }
        });

        return response()->json([
            'message' => 'Attendance saved successfully.',
            'class_name' => $data['class_name'],
            'date' => $data['date'],
        ]);
    }

    public function updateStudentAcademicDetails(Request $request): JsonResponse
    {
        $user = $request->user();
        abort_unless($user && $user->role === 'student', 403, 'Only student accounts can update student class details.');

        $data = $request->validate([
            'class_name' => ['required', 'string', 'in:BSIT 1-A,BSIT 1-B,BSIT 2-A,BSIT 2-B,BIT2B,BIT AE3,BIT3AE'],
            'year_level' => ['required', 'string', 'in:1st Year,2nd Year,3rd Year,4th Year'],
        ]);

        $user->update($data);

        return response()->json([
            'message' => 'Student class details saved successfully.',
            'user' => [
                'id' => $user->id,
                'class_name' => $user->class_name,
                'year_level' => $user->year_level,
            ],
        ]);
    }

    public function submissions(Request $request): JsonResponse
{
    $user = $request->user();

    abort_unless(
        in_array($user->role, ['student', 'teacher'], true),
        403
    );

    $query = HomeworkSubmission::query()
        ->with('student:id,name,email,class_name')
        ->latest('submitted_at');

    // Students may only view their own submissions.
    // Teachers may review all student submissions.
    if ($user->role === 'student') {
        $query->where('user_id', $user->id);
    }

    return response()->json([
        'submissions' => $query->get()->map(
            fn (HomeworkSubmission $submission) => [
                'id' => $submission->id,
                'subject' => $submission->subject,
                'title' => $submission->title,
                'description' => $submission->description,
                'status' => $submission->status,
                'submitted_at' => $submission->submitted_at?->toISOString(),
                'section' => $submission->student?->class_name,
                'student' => $user->role === 'teacher' ? [
                    'id' => $submission->student->id,
                    'name' => $submission->student->name,
                    'email' => $submission->student->email,
                    'class_name' => $submission->student->class_name,
                ] : null,
            ]
        )->all(),
    ]);
}
    public function updateHomeworkStatus(Request $request, HomeworkSubmission $submission): JsonResponse
    {
        $this->requireRole($request, 'teacher');

        $data = $request->validate([
            'status' => ['required', 'in:Done,Not Done'],
        ]);

        $submission->update(['status' => $data['status']]);

        return response()->json([
            'message' => 'Homework status updated successfully.',
            'submission' => [
                'id' => $submission->id,
                'status' => $submission->status,
            ],
        ]);
    }

    public function submitHomework(Request $request): JsonResponse
    {
        $this->requireRole($request, 'student');
        $data = $request->validate([
            'subject' => ['required', 'string', 'max:120'],
            'title' => ['required', 'string', 'max:180'],
            'description' => ['required', 'string', 'max:10000'],
        ]);

        $submission = HomeworkSubmission::query()->create([
            'user_id' => $request->user()->id,
            'subject' => trim($data['subject']),
            'title' => trim($data['title']),
            'description' => trim($data['description']),
            'status' => 'Submitted',
            'submitted_at' => now(),
        ]);

        return response()->json([
            'message' => 'Homework submitted successfully.',
            'submission' => [
                'id' => $submission->id,
                'subject' => $submission->subject,
                'title' => $submission->title,
                'description' => $submission->description,
                'status' => $submission->status,
                'submitted_at' => $submission->submitted_at?->toISOString(),
            ],
        ], 201);
    }
}
