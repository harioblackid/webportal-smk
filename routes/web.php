<?php

use App\Http\Controllers\Public\HomeController;
use App\Http\Controllers\Public\MajorController;
use App\Http\Controllers\Public\PageController;
use App\Http\Controllers\Public\PostController;
use Illuminate\Support\Facades\Route;

/*
 * Public site (prd-04 §2). Slugs only, no query strings for content — FR6-7
 * keeps ?page for pagination and nothing else.
 */

Route::get('/', [HomeController::class, 'index'])->name('home');

Route::get('profil', [PageController::class, 'profil'])->name('profil');
Route::get('kontak', [PageController::class, 'kontak'])->name('kontak');

Route::get('berita', [PostController::class, 'index'])->name('posts.index');
// Declared before the slug route, which would otherwise swallow "kategori".
Route::get('berita/kategori/{category:slug}', [PostController::class, 'category'])
    ->name('posts.category');
Route::get('berita/{slug}', [PostController::class, 'show'])->name('posts.show');

Route::get('jurusan', [MajorController::class, 'index'])->name('majors.index');
Route::get('jurusan/{slug}', [MajorController::class, 'show'])->name('majors.show');

// A fallback route, unlike the exception handler, still runs the web group —
// so the 404 page gets the shared props its layout needs.
Route::fallback([PageController::class, 'notFound']);
