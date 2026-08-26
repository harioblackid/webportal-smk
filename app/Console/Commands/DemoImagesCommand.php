<?php

namespace App\Console\Commands;

use Database\Seeders\DemoSeeder;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Storage;

/**
 * Downloads the demo photo set used by {@see DemoSeeder}.
 *
 * Kept separate from the seeder so the network call happens once and stays
 * cached: seeding is re-run often while iterating on fixtures, and re-fetching
 * twenty photos each time would be slow and rude to the CDN.
 *
 * Source is Pexels, whose licence allows commercial use with no attribution
 * required — appropriate for a school site. These are still STOCK photos and
 * are test material only; `demo:clear` removes them again.
 */
class DemoImagesCommand extends Command
{
    protected $signature = 'demo:images {--force : Re-download photos that are already cached}';

    protected $description = 'Download the demo photo set (Pexels) into the local cache';

    /** Relative to the `local` disk, i.e. storage/app/private/demo-images. */
    public const DIRECTORY = 'demo-images';

    /**
     * Cached as WebP because ImageProcessor keeps whatever format it is handed,
     * and FR6-14 asks for a modern format where possible.
     */
    public const EXTENSION = 'webp';

    /**
     * Slug => Pexels photo id. The slug is the cache filename and the key the
     * seeder looks photos up by.
     *
     * @var array<string, int>
     */
    public const PHOTOS = [
        'hero-utama' => 12719306,
        'ppdb-banner' => 12719273,

        'jurusan-rekayasa-perangkat-lunak' => 5530447,
        'jurusan-teknik-komputer-dan-jaringan' => 18471480,
        'jurusan-akuntansi-dan-keuangan-lembaga' => 3747486,
        'jurusan-cadangan' => 5530484,

        'berita-01' => 32218913,
        'berita-02' => 29599422,
        'berita-03' => 31940733,
        'berita-04' => 35548842,
        'berita-05' => 35865718,
        'berita-06' => 37061418,
        'berita-07' => 5849168,
        'berita-08' => 18772861,
        'berita-09' => 13584775,
        'berita-10' => 12719310,
        'berita-11' => 35161342,
        'berita-12' => 13389844,
        'berita-13' => 10489236,
        'berita-14' => 12719298,
        'berita-15' => 13240743,
        'berita-16' => 19954773,
    ];

    /** Matches ImageProcessor::DISPLAY_WIDTH — a larger fetch would just be discarded. */
    private const WIDTH = 1600;

    public function handle(): int
    {
        $disk = Storage::disk('local');
        $disk->makeDirectory(self::DIRECTORY);

        $force = (bool) $this->option('force');
        $downloaded = 0;
        $skipped = 0;

        foreach (self::PHOTOS as $slug => $id) {
            $path = self::DIRECTORY.'/'.$slug.'.'.self::EXTENSION;

            if (! $force && $disk->exists($path)) {
                $skipped++;

                continue;
            }

            $webp = $this->fetch($id);

            if ($webp === null) {
                $this->components->error("Gagal mengunduh foto {$id} ({$slug}).");

                return self::FAILURE;
            }

            $disk->put($path, $webp);
            $downloaded++;
            $this->components->twoColumnDetail($slug, number_format(strlen($webp) / 1024, 0).' KB');
        }

        $this->components->info("Foto demo siap: {$downloaded} diunduh, {$skipped} dari cache.");

        return self::SUCCESS;
    }

    /** Fetches one photo and re-encodes it to WebP, or null when anything fails. */
    private function fetch(int $id): ?string
    {
        $url = "https://images.pexels.com/photos/{$id}/pexels-photo-{$id}.jpeg";

        $response = Http::timeout(60)->retry(2, 1000, throw: false)->get($url, [
            'auto' => 'compress',
            'cs' => 'tinysrgb',
            'w' => self::WIDTH,
        ]);

        if (! $response->successful()) {
            return null;
        }

        return $this->toWebp($response->body());
    }

    /**
     * Re-encodes at a high quality on purpose: ImageProcessor re-encodes again at
     * 82 when the seeder stores it, and stacking two lossy passes at the same
     * quality is what makes seeded photos look muddy.
     */
    private function toWebp(string $bytes): ?string
    {
        $image = @imagecreatefromstring($bytes);

        if ($image === false) {
            return null;
        }

        ob_start();
        imagewebp($image, null, 92);
        $webp = (string) ob_get_clean();
        imagedestroy($image);

        return $webp === '' ? null : $webp;
    }
}
