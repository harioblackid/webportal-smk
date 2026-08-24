<?php

use App\Models\Media;
use App\Models\Post;
use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

use function Pest\Laravel\actingAs;

// US-014 — media library dengan optimasi & alt text.

beforeEach(function () {
    // A real disk would leave the resized files behind between runs; the fake
    // still exercises ImageProcessor, which writes through Storage.
    Storage::fake('public');
});

test('an editor uploads an image and both versions are written', function () {
    $file = UploadedFile::fake()->image('kegiatan.jpg', 2400, 1600);

    actingAs(User::factory()->create())
        ->post(route('admin.media.store'), ['file' => $file, 'alt' => 'Siswa praktik'])
        ->assertRedirect();

    $media = Media::query()->sole();

    expect($media->alt)->toBe('Siswa praktik')
        ->and($media->filename)->toBe('kegiatan.jpg')
        ->and($media->thumb_path)->not->toBeNull();

    Storage::disk('public')->assertExists($media->path);
    Storage::disk('public')->assertExists((string) $media->thumb_path);
});

// FR5-16 — gambar dioptimalkan/diubah ukuran wajar untuk web.

test('an oversized image is scaled down and the thumbnail is smaller again', function () {
    actingAs(User::factory()->create())
        ->post(route('admin.media.store'), [
            'file' => UploadedFile::fake()->image('besar.jpg', 3000, 2000),
        ]);

    $media = Media::query()->sole();
    $disk = Storage::disk('public');

    [$width] = getimagesizefromstring((string) $disk->get($media->path));
    [$thumbWidth] = getimagesizefromstring((string) $disk->get((string) $media->thumb_path));

    expect($width)->toBe(1600)
        ->and($thumbWidth)->toBe(480);
});

test('a small image is not upscaled', function () {
    actingAs(User::factory()->create())
        ->post(route('admin.media.store'), [
            'file' => UploadedFile::fake()->image('kecil.png', 300, 200),
        ]);

    $media = Media::query()->sole();
    [$width] = getimagesizefromstring((string) Storage::disk('public')->get($media->path));

    expect($width)->toBe(300);
});

test('the uploader is recorded', function () {
    $editor = User::factory()->create();

    actingAs($editor)->post(route('admin.media.store'), [
        'file' => UploadedFile::fake()->image('foto.jpg'),
    ]);

    expect(Media::query()->sole()->uploaded_by)->toBe($editor->id);
});

// FR5-15 — validasi tipe & ukuran.

test('a non-image upload is rejected', function () {
    actingAs(User::factory()->create())
        ->post(route('admin.media.store'), [
            'file' => UploadedFile::fake()->create('daftar.pdf', 100, 'application/pdf'),
        ])
        ->assertSessionHasErrors('file');

    expect(Media::query()->count())->toBe(0);
});

test('an image over the size limit is rejected', function () {
    actingAs(User::factory()->create())
        ->post(route('admin.media.store'), [
            // 4 MB against the 3 MB ceiling from OQ5-2.
            'file' => UploadedFile::fake()->create('besar.jpg', 4096, 'image/jpeg'),
        ])
        ->assertSessionHasErrors('file');

    expect(Media::query()->count())->toBe(0);
});

// FR5-17 — alt text tersedia dan tersimpan.

test('alt text can be edited after upload', function () {
    $media = Media::factory()->create(['alt' => 'lama']);

    actingAs(User::factory()->create())
        ->put(route('admin.media.update', $media), ['alt' => 'Upacara bendera'])
        ->assertRedirect();

    expect($media->refresh()->alt)->toBe('Upacara bendera');
});

test('deleting media removes the files as well as the row', function () {
    actingAs(User::factory()->create())->post(route('admin.media.store'), [
        'file' => UploadedFile::fake()->image('hapus.jpg'),
    ]);

    $media = Media::query()->sole();
    $path = $media->path;
    $thumbPath = (string) $media->thumb_path;

    actingAs(User::factory()->create())
        ->delete(route('admin.media.destroy', $media))
        ->assertRedirect();

    expect(Media::query()->count())->toBe(0);
    Storage::disk('public')->assertMissing($path);
    Storage::disk('public')->assertMissing($thumbPath);
});

test('a post keeps existing when the image it used is deleted', function () {
    // The foreign key is nullOnDelete, so the berita loses its picture rather
    // than disappearing with it.
    $media = Media::factory()->create();
    $post = Post::factory()->create(['featured_media_id' => $media->id]);

    actingAs(User::factory()->create())
        ->delete(route('admin.media.destroy', $media));

    expect($post->refresh()->featured_media_id)->toBeNull();
});
