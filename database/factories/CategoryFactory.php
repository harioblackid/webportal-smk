<?php

namespace Database\Factories;

use App\Models\Category;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<Category>
 */
class CategoryFactory extends Factory
{
    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        // unique() on the leading word is what keeps the slug unique.
        $name = fake()->unique()->word().' '.fake()->word();

        return [
            'name' => Str::title($name),
            'slug' => Str::slug($name),
        ];
    }
}
