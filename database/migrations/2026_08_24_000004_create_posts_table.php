<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * prd-07 §3.3 — berita & pengumuman.
 *
 * FR7-3 asks for a composite index on (status, published_at): the public list
 * always filters on status and orders by published_at, so the pair keeps that
 * query off a filesort. `slug` is indexed by its unique constraint.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('posts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('category_id')
                ->nullable()
                ->constrained('categories')
                ->nullOnDelete();
            $table->foreignId('user_id')
                ->nullable()
                ->constrained('users')
                ->nullOnDelete();
            $table->string('title', 200);
            $table->string('slug', 220)->unique();
            $table->string('excerpt', 300)->nullable();
            $table->longText('body');
            $table->foreignId('featured_media_id')
                ->nullable()
                ->constrained('media')
                ->nullOnDelete();
            $table->enum('type', ['berita', 'pengumuman'])->default('berita');
            $table->enum('status', ['draft', 'published'])->default('draft');
            $table->timestamp('published_at')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->index(['status', 'published_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('posts');
    }
};
