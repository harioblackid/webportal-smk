<?php

use App\Http\Controllers\Auth\AuthenticatedSessionController;
use App\Http\Controllers\Auth\NewPasswordController;
use App\Http\Controllers\Auth\PasswordResetLinkController;
use Illuminate\Support\Facades\Route;

/*
 * Ported from Laravel Breeze's Inertia stack, trimmed to what prd-05 asks for.
 *
 * FR5-3 rules out public registration — accounts are created by a Superadmin
 * (US-016) — so Breeze's register routes are deliberately absent. Email
 * verification is likewise omitted: accounts do not self-serve.
 *
 * Rate limiting on login (NFR-13) lives in LoginRequest::ensureIsNotRateLimited.
 */

Route::middleware('guest')->group(function () {
    Route::get('login', [AuthenticatedSessionController::class, 'create'])
        ->name('login');

    Route::post('login', [AuthenticatedSessionController::class, 'store']);

    // FR5-4: reset by email. Needs working SMTP in production; with
    // MAIL_MAILER=log the link lands in the Laravel log instead.
    Route::get('forgot-password', [PasswordResetLinkController::class, 'create'])
        ->name('password.request');

    Route::post('forgot-password', [PasswordResetLinkController::class, 'store'])
        ->name('password.email');

    Route::get('reset-password/{token}', [NewPasswordController::class, 'create'])
        ->name('password.reset');

    Route::post('reset-password', [NewPasswordController::class, 'store'])
        ->name('password.store');
});

Route::post('logout', [AuthenticatedSessionController::class, 'destroy'])
    ->middleware('auth')
    ->name('logout');
