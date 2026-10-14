<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('attendance_records', function (Blueprint $table) {
            $table->id();
            $table->string('class_name', 100);
            $table->date('attendance_date');
            $table->string('student_code', 40);
            $table->string('student_name', 120);
            $table->string('status', 20);
            $table->foreignId('recorded_by')->constrained('users')->cascadeOnDelete();
            $table->timestamps();
            $table->unique(['class_name', 'attendance_date', 'student_code'], 'attendance_class_date_student_unique');
            $table->index(['class_name', 'attendance_date']);
        });

        Schema::create('homework_submissions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->string('subject', 120);
            $table->string('title', 180);
            $table->text('description');
            $table->string('status', 30)->default('Submitted');
            $table->timestamp('submitted_at');
            $table->timestamps();
            $table->index(['user_id', 'submitted_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('homework_submissions');
        Schema::dropIfExists('attendance_records');
    }
};
