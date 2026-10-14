<?php

namespace Tests\Feature;

use App\Models\AttendanceRecord;
use App\Models\HomeworkSubmission;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PortalDataTest extends TestCase
{
    use RefreshDatabase;

    public function test_only_teachers_can_load_attendance_classes(): void
    {
        $student = User::factory()->create(['role' => 'student']);

        $this->actingAs($student)
            ->getJson('/api/attendance/classes')
            ->assertForbidden();
    }

    public function test_teacher_can_save_and_retrieve_class_attendance_and_history(): void
    {
        $teacher = User::factory()->create(['role' => 'teacher']);
        $records = [
            ['student_code' => 'LLCC-BSIT1A-001', 'status' => 'Present'],
            ['student_code' => 'LLCC-BSIT1A-002', 'status' => 'Absent'],
            ['student_code' => 'LLCC-BSIT1A-003', 'status' => 'Late'],
            ['student_code' => 'LLCC-BSIT1A-004', 'status' => 'Present'],
            ['student_code' => 'LLCC-BSIT1A-005', 'status' => 'Excused'],
        ];

        $this->actingAs($teacher)
            ->putJson('/api/attendance', [
                'class_name' => 'BSIT 1-A',
                'date' => '2026-10-14',
                'records' => $records,
            ])
            ->assertOk()
            ->assertJsonPath('message', 'Attendance saved successfully.');

        $this->assertDatabaseCount('attendance_records', 5);
        $this->assertDatabaseHas('attendance_records', [
            'class_name' => 'BSIT 1-A',
            'attendance_date' => '2026-10-14',
            'student_code' => 'LLCC-BSIT1A-002',
            'status' => 'Absent',
            'recorded_by' => $teacher->id,
        ]);

        $this->actingAs($teacher)
            ->getJson('/api/attendance?class_name=BSIT%201-A&date=2026-10-14')
            ->assertOk()
            ->assertJsonPath('records.1.status', 'Absent')
            ->assertJsonPath('records.2.status', 'Late')
            ->assertJsonPath('history.0.date', '2026-10-14');
    }

    public function test_teacher_cannot_save_attendance_for_unknown_student_codes(): void
    {
        $teacher = User::factory()->create(['role' => 'teacher']);
        $records = [
            ['student_code' => 'FAKE-STUDENT', 'status' => 'Present'],
        ];

        $this->actingAs($teacher)
            ->putJson('/api/attendance', [
                'class_name' => 'BSIT 1-A',
                'date' => '2026-10-14',
                'records' => $records,
            ])
            ->assertUnprocessable();

        $this->assertDatabaseCount('attendance_records', 0);
    }

    public function test_student_homework_submission_is_saved_to_the_authenticated_account(): void
    {
        $student = User::factory()->create(['role' => 'student']);

        $this->actingAs($student)
            ->postJson('/api/homework/submissions', [
                'subject' => 'Mathematics',
                'title' => 'Algebra Practice',
                'description' => 'Solve the assigned equations.',
                'user_id' => 99999,
                'status' => 'Approved',
            ])
            ->assertCreated()
            ->assertJsonPath('submission.status', 'Submitted');

        $this->assertDatabaseHas('homework_submissions', [
            'user_id' => $student->id,
            'subject' => 'Mathematics',
            'title' => 'Algebra Practice',
            'status' => 'Submitted',
        ]);
        $this->assertDatabaseMissing('homework_submissions', ['user_id' => 99999]);
    }

    public function test_students_only_receive_their_own_homework_submissions(): void
    {
        $student = User::factory()->create(['role' => 'student']);
        $otherStudent = User::factory()->create(['role' => 'student']);
        HomeworkSubmission::query()->create([
            'user_id' => $student->id,
            'subject' => 'English',
            'title' => 'Essay',
            'description' => 'My essay',
            'status' => 'Submitted',
            'submitted_at' => now(),
        ]);
        HomeworkSubmission::query()->create([
            'user_id' => $otherStudent->id,
            'subject' => 'Science',
            'title' => 'Lab report',
            'description' => 'Other student work',
            'status' => 'Submitted',
            'submitted_at' => now(),
        ]);

        $this->actingAs($student)
            ->getJson('/api/homework/submissions')
            ->assertOk()
            ->assertJsonCount(1, 'submissions')
            ->assertJsonPath('submissions.0.title', 'Essay');
    }

    public function test_teacher_can_review_submissions_but_cannot_submit_as_a_student(): void
    {
        $teacher = User::factory()->create(['role' => 'teacher']);
        $student = User::factory()->create(['role' => 'student']);
        HomeworkSubmission::query()->create([
            'user_id' => $student->id,
            'subject' => 'Science',
            'title' => 'Lab report',
            'description' => 'Report body',
            'status' => 'Submitted',
            'submitted_at' => now(),
        ]);

        $this->actingAs($teacher)
            ->getJson('/api/homework/submissions')
            ->assertOk()
            ->assertJsonCount(1, 'submissions')
            ->assertJsonPath('submissions.0.student.name', $student->name);

        $this->actingAs($teacher)
            ->postJson('/api/homework/submissions', [
                'subject' => 'Science',
                'title' => 'Lab report',
                'description' => 'Not allowed',
            ])
            ->assertForbidden();
    }
}
