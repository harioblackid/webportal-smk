<?php

use App\Models\Major;
use App\Models\Media;
use App\Models\Post;
use App\Models\User;
use Inertia\Testing\AssertableInertia;

use function Pest\Laravel\actingAs;

// FR5-6 — ringkasan jumlah berita, berita terbaru, dan tautan aksi cepat.

test('the dashboard summarises the content the school has', function () {
    Post::factory()->published()->count(2)->create();
    Post::factory()->create(['title' => 'Draf terbaru']);
    Major::factory()->count(3)->create();
    Major::factory()->inactive()->create();
    Media::factory()->create();

    actingAs(User::factory()->create())
        ->get(route('admin.dashboard'))
        ->assertOk()
        ->assertInertia(fn (AssertableInertia $page) => $page
            ->component('admin/dashboard')
            ->where('stats.published', 2)
            ->where('stats.draft', 1)
            // Only active jurusan are counted — that is what the public sees.
            ->where('stats.majors', 3)
            ->where('stats.media', 1)
            ->has('recentPosts', 3)
            ->where('recentPosts.0.title', 'Draf terbaru'));
});

test('the dashboard is fine with an empty site', function () {
    actingAs(User::factory()->create())
        ->get(route('admin.dashboard'))
        ->assertOk()
        ->assertInertia(fn (AssertableInertia $page) => $page
            ->where('stats.published', 0)
            ->has('recentPosts', 0));
});
