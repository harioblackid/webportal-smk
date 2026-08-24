<?php

namespace Database\Factories;

use App\Models\Hero;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Hero>
 */
class HeroFactory extends Factory
{
    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'title' => fake()->sentence(5),
            'subtitle' => fake()->sentence(10),
            'media_id' => null,
            'cta1_text' => 'Info PPDB',
            'cta1_url' => 'https://ppdb.example.test',
            'cta2_text' => 'Lihat Jurusan',
            'cta2_url' => '/jurusan',
            'is_active' => false,
        ];
    }

    public function active(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_active' => true,
        ]);
    }
}
