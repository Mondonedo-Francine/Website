<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\AdminController;
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

Route::get('/', function () {
    return view('welcome');
});
