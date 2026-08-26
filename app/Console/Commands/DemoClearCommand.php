<?php

namespace App\Console\Commands;

use App\Models\Hero;
use App\Models\Major;
use App\Models\Media;
use App\Models\Post;
use App\Models\Setting;
use App\Models\User;
use App\Support\ImageProcessor;
use Database\Seeders\DemoSeeder;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Storage;

/**
 * Undoes {@see DemoSeeder}.
 *
 * The demo photos are stock images of other people's schools. They are fine as
 * test material and wrong as published content, so removing them has to be one
 * command rather than an afternoon of manual tidying.
 *
 * References are restored from the snapshot the seeder wrote, so rows that
 * already had an image before seeding get their original one back instead of
 * being left null.
 */
class DemoClearCommand extends Command
{
    protected $signature = 'demo:clear {--force : Skip the confirmation prompt}';

    protected $description = 'Remove demo content and images created by DemoSeeder';

    public function handle(): int
    {
        $posts = Post::withTrashed()->where('slug', 'like', DemoSeeder::MARKER.'%')->get();
        $media = Media::query()->where('filename', 'like', DemoSeeder::MARKER.'%')->get();
        $users = User::withTrashed()->where('email', 'like', '%@demo.test')->get();

        if ($posts->isEmpty() && $media->isEmpty() && $users->isEmpty()) {
            $this->components->info('Tidak ada konten demo yang perlu dihapus.');

            return self::SUCCESS;
        }

        $confirmed = (bool) $this->option('force') || $this->confirm(
            "Hapus {$posts->count()} berita, {$media->count()} media, dan {$users->count()} akun demo?",
            true,
        );

        if (! $confirmed) {
            $this->components->warn('Dibatalkan.');

            return self::SUCCESS;
        }

        $this->restore($media->pluck('id')->all());

        foreach ($posts as $post) {
            $post->forceDelete();
        }

        foreach ($media as $item) {
            ImageProcessor::forget($item->path, $item->thumb_path);
            $item->delete();
        }

        foreach ($users as $user) {
            $user->forceDelete();
        }

        $this->components->info(
            "Konten demo dihapus: {$posts->count()} berita, {$media->count()} media, {$users->count()} akun."
        );

        return self::SUCCESS;
    }

    /**
     * Puts back whatever each row pointed at before seeding. Anything still
     * aimed at a demo image after that is nulled, because the image is about to
     * be deleted and a dangling id renders as a broken box.
     *
     * @param  array<int, int>  $demoMediaIds
     */
    private function restore(array $demoMediaIds): void
    {
        $snapshot = $this->snapshot();

        foreach (Hero::query()->get() as $hero) {
            $original = $snapshot['heroes'][$hero->id] ?? null;
            $hero->update(['media_id' => $this->resolve($hero->media_id, $original, $demoMediaIds)]);
        }

        foreach (Major::withTrashed()->get() as $major) {
            $original = $snapshot['majors'][$major->id] ?? null;
            $major->update(['media_id' => $this->resolve($major->media_id, $original, $demoMediaIds)]);
        }

        foreach (Post::withTrashed()->get() as $post) {
            $original = $snapshot['posts'][$post->id] ?? null;
            $post->update([
                'featured_media_id' => $this->resolve($post->featured_media_id, $original, $demoMediaIds),
            ]);
        }

        $mapsOriginal = $snapshot['settings']['maps_embed'] ?? null;

        if (Setting::get('maps_embed') === DemoSeeder::MAPS_EMBED) {
            Setting::put('maps_embed', is_string($mapsOriginal) ? $mapsOriginal : null);
        }

        foreach (['logo_media_id', 'ppdb_banner_media_id'] as $key) {
            $current = Setting::get($key);
            $original = $snapshot['settings'][$key] ?? null;

            if ($current !== null && in_array((int) $current, $demoMediaIds, true)) {
                Setting::put($key, is_string($original) ? $original : null);
            }
        }
    }

    /**
     * @param  array<int, int>  $demoMediaIds
     */
    private function resolve(?int $current, mixed $original, array $demoMediaIds): ?int
    {
        if ($current === null || ! in_array($current, $demoMediaIds, true)) {
            return $current;
        }

        return is_int($original) ? $original : null;
    }

    /**
     * @return array{heroes: array<array-key, mixed>, majors: array<array-key, mixed>, posts: array<array-key, mixed>, settings: array<array-key, mixed>}
     */
    private function snapshot(): array
    {
        $empty = ['heroes' => [], 'majors' => [], 'posts' => [], 'settings' => []];
        $disk = Storage::disk('local');

        if (! $disk->exists(DemoSeeder::SNAPSHOT)) {
            return $empty;
        }

        $decoded = json_decode((string) $disk->get(DemoSeeder::SNAPSHOT), true);

        if (! is_array($decoded)) {
            return $empty;
        }

        return [
            'heroes' => is_array($decoded['heroes'] ?? null) ? $decoded['heroes'] : [],
            'majors' => is_array($decoded['majors'] ?? null) ? $decoded['majors'] : [],
            'posts' => is_array($decoded['posts'] ?? null) ? $decoded['posts'] : [],
            'settings' => is_array($decoded['settings'] ?? null) ? $decoded['settings'] : [],
        ];
    }
}
