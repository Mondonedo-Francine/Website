<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\AdminController;
use App\Http\Controllers\PortalDataController;
use App\Http\Controllers\ProfilePictureController;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;
use Illuminate\Http\Request;

Route::view('/portal', 'llcc-portal');

Route::get('/admin', [AdminController::class, 'index']);
Route::post('/admin/teachers', [AdminController::class, 'storeTeacher'])->middleware('throttle:10,1');
Route::post('/admin/logout', [AdminController::class, 'logout']);

Route::post('/auth/login', [AuthController::class, 'login'])->middleware('throttle:10,1');
Route::post('/auth/register', [AuthController::class, 'register'])->middleware('throttle:10,1');
Route::get('/auth/user', function (Request $request) {
    if (! Auth::check()) {
        return response()->json(['message' => 'Unauthenticated.'], 401);
    }

    return response()->json(['user' => AuthController::publicUser($request->user())]);
});
Route::post('/auth/logout', [AuthController::class, 'logout']);


Route::middleware('auth')->prefix('api')->group(function () {
    Route::post('/profile/picture', [ProfilePictureController::class, 'store']);
    Route::delete('/profile/picture', [ProfilePictureController::class, 'destroy']);
    Route::get('/attendance/student', [PortalDataController::class, 'studentAttendance']);
    Route::get('/attendance/classes', [PortalDataController::class, 'attendanceClasses']);
    Route::get('/attendance', [PortalDataController::class, 'attendance']);
    Route::put('/attendance', [PortalDataController::class, 'saveAttendance']);
    Route::put('/student/academic-details', [PortalDataController::class, 'updateStudentAcademicDetails']);
    Route::get('/homework/submissions', [PortalDataController::class, 'submissions']);
    Route::post('/homework/submissions', [PortalDataController::class, 'submitHomework']);
    Route::patch('/homework/submissions/{submission}/status', [PortalDataController::class, 'updateHomeworkStatus']);

    Route::get('/messages/contacts', [\App\Http\Controllers\DirectMessageController::class, 'contacts']);
    Route::get('/messages/{user}', [\App\Http\Controllers\DirectMessageController::class, 'index']);
    Route::post('/messages/{user}', [\App\Http\Controllers\DirectMessageController::class, 'store'])
        ->middleware('throttle:60,1');
});


Route::get('/', function () {
    return view('welcome');
});
