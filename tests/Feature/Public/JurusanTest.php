<?php

use App\Models\Major;
use App\Models\Media;
use Inertia\Testing\AssertableInertia;

test('the list shows active majors in their configured order', function () {
    // FR4-16: sort_order is the school's ordering, not alphabetical.
    Major::factory()->create(['name' => 'Ketiga', 'sort_order' => 3]);
    Major::factory()->create(['name' => 'Pertama', 'sort_order' => 1]);
    Major::factory()->create(['name' => 'Kedua', 'sort_order' => 2]);
    Major::factory()->inactive()->create(['name' => 'Nonaktif', 'sort_order' => 0]);

    $this->get(route('majors.index'))
        ->assertOk()
        ->assertInertia(fn (AssertableInertia $page) => $page
            ->component('public/jurusan/index')
            ->count('majors', 3)
            ->where('majors.0.name', 'Pertama')
            ->where('majors.1.name', 'Kedua')
            ->where('majors.2.name', 'Ketiga')
        )
        ->assertDontSee('Nonaktif');
});

test('a major is reachable by the slug of its name', function () {
    // FR4-16c
    $media = Media::factory()->create(['alt' => 'Praktik RPL']);
    Major::factory()->create([
        'name' => 'Rekayasa Perangkat Lunak',
        'slug' => 'rekayasa-perangkat-lunak',
        'excerpt' => 'Belajar membangun perangkat lunak.',
        'description' => '<p>Deskripsi lengkap.</p>',
        'extra' => '<ul><li>Programmer</li></ul>',
        'media_id' => $media->id,
    ]);

    $this->get('/jurusan/rekayasa-perangkat-lunak')
        ->assertOk()
        ->assertInertia(fn (AssertableInertia $page) => $page
            ->component('public/jurusan/show')
            ->where('major.name', 'Rekayasa Perangkat Lunak')
            ->where('major.description', '<p>Deskripsi lengkap.</p>')
            ->where('major.extra', '<ul><li>Programmer</li></ul>')
            ->where('major.image.alt', 'Praktik RPL')
            ->where('seo.title', 'Rekayasa Perangkat Lunak')
            ->where('seo.description', 'Belajar membangun perangkat lunak.')
        );
});

test('an inactive major returns 404 on its detail page', function () {
    // FR4-16b
    $major = Major::factory()->inactive()->create(['slug' => 'jurusan-nonaktif']);

    $this->get(route('majors.show', $major->slug))
        ->assertNotFound()
        ->assertInertia(fn (AssertableInertia $page) => $page
            ->component('public/error')
            ->where('status', 404)
        );
});

test('the detail page suggests other active majors', function () {
    $major = Major::factory()->create(['slug' => 'utama']);
    Major::factory()->count(4)->create();
    Major::factory()->inactive()->create();

    $this->get(route('majors.show', $major->slug))
        ->assertInertia(fn (AssertableInertia $page) => $page
            ->count('others', 3)
            ->where('others.0.id', fn (int $id) => $id !== $major->id)
        );
});

test('the list survives an empty CMS', function () {
    $this->get(route('majors.index'))
        ->assertOk()
        ->assertInertia(fn (AssertableInertia $page) => $page->count('majors', 0));
});
