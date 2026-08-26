<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Galeri foto — albums of photos drawn from the existing media library.
 *
 * Albums rather than one flat grid: a school's photos arrive per event, and a
 * single stream of several hundred images is not something a visitor browses.
 * The photos themselves stay in `media`, so the same upload can appear in an
 * album and in a berita without being stored twice.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('gallery_albums', function (Blueprint $table) {
            $table->id();
            $table->string('title', 150);
            $table->string('slug', 170)->unique();
            $table->text('description')->nullable();
            $table->foreignId('cover_media_id')
                ->nullable()
                ->constrained('media')
                ->nullOnDelete();
            $table->unsignedInteger('sort_order')->default(0);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
            $table->softDeletes();

            $table->index(['is_active', 'sort_order']);
        });

        Schema::create('gallery_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('album_id')
                ->constrained('gallery_albums')
                ->cascadeOnDelete();
            // Cascade here too: the row exists only to point at the image, so
            // deleting the image from the library empties the slot as well.
            $table->foreignId('media_id')
                ->constrained('media')
                ->cascadeOnDelete();
            $table->string('caption', 200)->nullable();
            $table->unsignedInteger('sort_order')->default(0);
            $table->timestamps();

            $table->index(['album_id', 'sort_order']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('gallery_items');
        Schema::dropIfExists('gallery_albums');
    }
};
