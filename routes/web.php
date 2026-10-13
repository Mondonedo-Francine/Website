<?php

use Illuminate\Support\Facades\Route;

Route::view('/portal', 'llcc-portal');

Route::get('/', function () {
    return view('welcome');
});
