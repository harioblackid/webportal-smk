<?php

use App\Http\Controllers\Public\CurriculumController;
use App\Http\Controllers\Public\HomeController;
use App\Http\Controllers\Public\MajorController;
use App\Http\Controllers\Public\PageController;
use App\Http\Controllers\Public\PostController;
use App\Http\Controllers\Public\SchoolIdentityController;
use App\Http\Controllers\Public\SitemapController;
use Illuminate\Support\Facades\Route;

/*
 * Public site (prd-04 §2). Slugs only, no query strings for content — FR6-7
 * keeps ?page for pagination and nothing else.
 */

Route::get('/', [HomeController::class, 'index'])->name('home');

Route::get('profil', [PageController::class, 'profil'])->name('profil');

// Profil sub-pages the CMS can switch off. The middleware answers 404 when a
// page is off, so an unlinked URL is not merely hidden — it is gone.
Route::get('profil/identitas', SchoolIdentityController::class)
    ->middleware('page:identitas')
    ->name('identitas');

Route::get('profil/spektrum-kurikulum', CurriculumController::class)
    ->middleware('page:spektrum')
    ->name('spektrum');

Route::get('kontak', [PageController::class, 'kontak'])->name('kontak');

Route::get('berita', [PostController::class, 'index'])->name('posts.index');
// Declared before the slug route, which would otherwise swallow "kategori".
Route::get('berita/kategori/{category:slug}', [PostController::class, 'category'])
    ->name('posts.category');
Route::get('berita/{slug}', [PostController::class, 'show'])->name('posts.show');

Route::get('jurusan', [MajorController::class, 'index'])->name('majors.index');
Route::get('jurusan/{slug}', [MajorController::class, 'show'])->name('majors.show');

// FR6-9 / FR6-10. public/robots.txt was deleted so these two stay the single
// source of truth for what crawlers are told.
Route::get('sitemap.xml', [SitemapController::class, 'sitemap'])->name('sitemap');
Route::get('robots.txt', [SitemapController::class, 'robots'])->name('robots');

// A fallback route, unlike the exception handler, still runs the web group —
// so the 404 page gets the shared props its layout needs.
Route::fallback([PageController::class, 'notFound']);
