<?php

use App\Http\Controllers\Admin\DashboardController;
use App\Http\Controllers\Admin\UserController;
use App\Http\Middleware\EnsureUserIsSuperadmin;
use Illuminate\Support\Facades\Route;

/*
 * Admin area (prd-02 §3.2). The prefix, the `auth` guard, and the noindex
 * header are applied to the whole file in bootstrap/app.php, so no route here
 * can accidentally ship without them.
 *
 * Superadmin-only routes carry EnsureUserIsSuperadmin on top (FR5-2).
 */

Route::get('/', [DashboardController::class, 'index'])->name('dashboard');

Route::middleware(EnsureUserIsSuperadmin::class)->group(function () {
    Route::get('users', [UserController::class, 'index'])->name('users.index');
});
