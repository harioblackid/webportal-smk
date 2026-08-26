<?php

use App\Http\Controllers\Admin\CategoryController;
use App\Http\Controllers\Admin\DashboardController;
use App\Http\Controllers\Admin\HeroController;
use App\Http\Controllers\Admin\MajorController;
use App\Http\Controllers\Admin\MediaController;
use App\Http\Controllers\Admin\PostController;
use App\Http\Controllers\Admin\SchoolIdentityController;
use App\Http\Controllers\Admin\SettingController;
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

/*
 * Shared by both roles (prd-05 §2): berita, kategori, hero, and media.
 */

Route::resource('posts', PostController::class)->except('show');

Route::resource('categories', CategoryController::class)
    ->only(['index', 'store', 'update', 'destroy']);

Route::resource('heroes', HeroController::class)->except('show');

// Without this, Laravel singularises the parameter to {medium}.
Route::resource('media', MediaController::class)
    ->parameters(['media' => 'media'])
    ->only(['index', 'store', 'update', 'destroy']);

/*
 * Superadmin only (FR5-2, FR5-15a). The middleware wraps the GET routes too,
 * so an Editor who types the URL gets 403 rather than a form that fails on
 * save.
 */

Route::middleware(EnsureUserIsSuperadmin::class)->group(function () {
    Route::resource('majors', MajorController::class)->except('show');

    // Identitas resmi sekolah. Superadmin only alongside settings: these
    // values are what the header, the footer, and the JSON-LD claim the school
    // is, so they are not editorial content.
    Route::get('school-identity', [SchoolIdentityController::class, 'edit'])
        ->name('school-identity.edit');
    Route::put('school-identity', [SchoolIdentityController::class, 'update'])
        ->name('school-identity.update');

    Route::get('settings', [SettingController::class, 'edit'])->name('settings.edit');
    Route::put('settings', [SettingController::class, 'update'])->name('settings.update');

    Route::resource('users', UserController::class)->except('show');
});
