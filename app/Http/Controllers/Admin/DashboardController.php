<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Major;
use App\Models\Media;
use App\Models\Post;
use Inertia\Inertia;
use Inertia\Response;

/**
 * FR5-6 — admin landing: counts, the newest berita, and the quick actions the
 * school reaches for most (tulis berita, atur hero).
 */
class DashboardController extends Controller
{
    private const RECENT_POSTS = 5;

    public function index(): Response
    {
        return Inertia::render('admin/dashboard', [
            'stats' => [
                'published' => Post::query()->where('status', 'published')->count(),
                'draft' => Post::query()->where('status', 'draft')->count(),
                'majors' => Major::query()->where('is_active', true)->count(),
                'media' => Media::query()->count(),
            ],
            'recentPosts' => Post::query()
                ->latest('id')
                ->limit(self::RECENT_POSTS)
                ->get(['id', 'title', 'status', 'published_at'])
                ->map(fn (Post $post) => [
                    'id' => $post->id,
                    'title' => $post->title,
                    'status' => $post->status,
                    'publishedAtLabel' => $post->published_at?->translatedFormat('j M Y'),
                    'editUrl' => route('admin.posts.edit', $post),
                ])
                ->all(),
        ]);
    }
}
