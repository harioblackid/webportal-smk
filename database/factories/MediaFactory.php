<?php

namespace Database\Factories;

use App\Models\Media;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<Media>
 */
class MediaFactory extends Factory
{
    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $filename = Str::slug(fake()->word().' '.fake()->word()).'.webp';

        return [
            'path' => 'media/'.$filename,
            'thumb_path' => 'media/thumbs/'.$filename,
            'filename' => $filename,
            'mime' => 'image/webp',
            'size' => fake()->numberBetween(20_000, 800_000),
            'alt' => fake()->sentence(4),
            'uploaded_by' => User::factory(),
        ];
    }
}
