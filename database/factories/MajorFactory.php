<?php

namespace Database\Factories;

use App\Models\Major;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<Major>
 */
class MajorFactory extends Factory
{
    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        // unique() on the leading word is what keeps the slug unique.
        $name = fake()->unique()->word().' '.fake()->word().' '.fake()->word();

        return [
            'name' => Str::title($name),
            'slug' => Str::slug($name),
            'excerpt' => fake()->text(180),
            'description' => '<p>'.fake()->paragraph().'</p>',
            'extra' => null,
            'media_id' => null,
            'sort_order' => 0,
            'is_active' => true,
        ];
    }

    public function inactive(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_active' => false,
        ]);
    }
}
