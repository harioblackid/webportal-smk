<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Ekstrakurikuler.
 *
 * One flat table and one public page: unlike jurusan, an ekskul is a paragraph
 * and a photo, not a programme with its own detail page — so there is no slug
 * route to reach, only a card on the list.
 *
 * `slug` is still stored: it is what an anchor link on the list can target,
 * and it keeps the door open to a detail page without a migration.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('extracurriculars', function (Blueprint $table) {
            $table->id();
            $table->string('name', 150);
            $table->string('slug', 170)->unique();
            $table->longText('description')->nullable();
            $table->string('pembina', 100)->nullable();
            $table->string('jadwal', 150)->nullable();
            $table->foreignId('media_id')
                ->nullable()
                ->constrained('media')
                ->nullOnDelete();
            $table->unsignedInteger('sort_order')->default(0);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
            $table->softDeletes();

            $table->index(['is_active', 'sort_order']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('extracurriculars');
    }
};
