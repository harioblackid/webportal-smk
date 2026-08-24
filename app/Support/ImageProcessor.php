<?php

namespace App\Support;

use GdImage;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use RuntimeException;

/**
 * FR5-16 — every upload is stored twice: a display version capped at
 * {@see self::DISPLAY_WIDTH} and a thumbnail for grids and cards.
 *
 * Written against GD directly rather than pulling in an imaging package: the
 * three formats FR5-15 accepts are exactly the three GD handles natively, and
 * the school's VPS already ships the extension.
 */
class ImageProcessor
{
    /** Wider than any content column in prd-03; anything larger is wasted bytes. */
    private const DISPLAY_WIDTH = 1600;

    /** Two columns of cards on a phone at 2× DPR. */
    private const THUMB_WIDTH = 480;

    private const QUALITY = 82;

    /**
     * Resizes and stores the upload, returning the row Media expects.
     *
     * @return array{path: string, thumb_path: string, filename: string, mime: string, size: int}
     */
    public static function store(UploadedFile $file): array
    {
        $source = self::read($file);
        $extension = self::extension($file);
        $directory = 'media/'.now()->format('Y/m');
        $name = Str::lower(Str::ulid()->toBase32());

        $disk = Storage::disk('public');
        $disk->makeDirectory($directory);

        $path = $directory.'/'.$name.'.'.$extension;
        $thumbPath = $directory.'/'.$name.'-thumb.'.$extension;

        self::write(self::resize($source, self::DISPLAY_WIDTH), $extension, $disk->path($path));
        self::write(self::resize($source, self::THUMB_WIDTH), $extension, $disk->path($thumbPath));

        imagedestroy($source);

        return [
            'path' => $path,
            'thumb_path' => $thumbPath,
            'filename' => (string) $file->getClientOriginalName(),
            'mime' => match ($extension) {
                'png' => 'image/png',
                'webp' => 'image/webp',
                default => 'image/jpeg',
            },
            'size' => (int) $disk->size($path),
        ];
    }

    /** Removes both derivatives; a missing file is not an error. */
    public static function forget(?string ...$paths): void
    {
        $disk = Storage::disk('public');

        foreach ($paths as $path) {
            if ($path !== null && $path !== '' && $disk->exists($path)) {
                $disk->delete($path);
            }
        }
    }

    private static function read(UploadedFile $file): GdImage
    {
        $contents = file_get_contents($file->getRealPath());
        $image = $contents === false ? false : imagecreatefromstring($contents);

        if ($image === false) {
            throw new RuntimeException('Berkas gambar tidak dapat dibaca.');
        }

        return self::orient($image, $file);
    }

    /**
     * Phone cameras record rotation in EXIF rather than in the pixels; GD
     * ignores it, so the thumbnail would come out sideways.
     */
    private static function orient(GdImage $image, UploadedFile $file): GdImage
    {
        if ($file->getMimeType() !== 'image/jpeg' || ! function_exists('exif_read_data')) {
            return $image;
        }

        $exif = @exif_read_data($file->getRealPath());
        $orientation = is_array($exif) ? ($exif['Orientation'] ?? null) : null;

        $rotated = match ($orientation) {
            3 => imagerotate($image, 180, 0),
            6 => imagerotate($image, -90, 0),
            8 => imagerotate($image, 90, 0),
            default => null,
        };

        if ($rotated === false || $rotated === null) {
            return $image;
        }

        imagedestroy($image);

        return $rotated;
    }

    /** Never upscales — a small upload stays small rather than going soft. */
    private static function resize(GdImage $source, int $width): GdImage
    {
        $sourceWidth = imagesx($source);
        $sourceHeight = imagesy($source);

        if ($sourceWidth <= $width) {
            $width = $sourceWidth;
            $height = $sourceHeight;
        } else {
            $height = (int) round($sourceHeight * ($width / $sourceWidth));
        }

        // A 1px floor: GD refuses a zero dimension, which a very wide, very
        // short banner would otherwise round its way into.
        $width = max(1, $width);
        $height = max(1, $height);

        $canvas = imagecreatetruecolor($width, $height);

        // Keeps PNG/WebP transparency instead of filling it black.
        imagealphablending($canvas, false);
        imagesavealpha($canvas, true);
        imagecopyresampled($canvas, $source, 0, 0, 0, 0, $width, $height, $sourceWidth, $sourceHeight);

        return $canvas;
    }

    private static function write(GdImage $image, string $extension, string $absolutePath): void
    {
        match ($extension) {
            'png' => imagepng($image, $absolutePath, 6),
            'webp' => imagewebp($image, $absolutePath, self::QUALITY),
            default => imagejpeg($image, $absolutePath, self::QUALITY),
        };

        imagedestroy($image);
    }

    /** Derived from the detected mime, not the name the browser sent. */
    private static function extension(UploadedFile $file): string
    {
        return match ($file->getMimeType()) {
            'image/png' => 'png',
            'image/webp' => 'webp',
            default => 'jpg',
        };
    }
}
