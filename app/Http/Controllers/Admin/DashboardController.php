<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Post;
use Inertia\Inertia;
use Inertia\Response;

/**
 * FR5-6 — admin landing. The full summary (latest posts, quick actions) is its
 * own story; this covers the counts US-010 needs a guarded page for.
 */
class DashboardController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('admin/dashboard', [
            'stats' => [
                'published' => Post::query()->where('status', 'published')->count(),
                'draft' => Post::query()->where('status', 'draft')->count(),
            ],
        ]);
    }
}
