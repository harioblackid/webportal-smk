<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * prd-07 §3.5 — hero halaman depan.
 *
 * FR7-6 ("only one active hero") is deliberately an application-layer rule,
 * not a schema constraint — see US-024.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('heroes', function (Blueprint $table) {
            $table->id();
            $table->string('title', 200);
            $table->string('subtitle', 300)->nullable();
            $table->foreignId('media_id')
                ->nullable()
                ->constrained('media')
                ->nullOnDelete();
            $table->string('cta1_text', 60)->nullable();
            $table->string('cta1_url')->nullable();
            $table->string('cta2_text', 60)->nullable();
            $table->string('cta2_url')->nullable();
            $table->boolean('is_active')->default(false);
            $table->timestamps();

            $table->index('is_active');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('heroes');
    }
};
