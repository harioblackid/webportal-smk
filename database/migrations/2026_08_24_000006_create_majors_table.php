<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * prd-07 §3.6 — jurusan / program keahlian.
 *
 * FR7-9: the public list runs `WHERE is_active = 1 ORDER BY sort_order`, so
 * the composite index is ordered (is_active, sort_order) to serve both halves
 * of that query. `slug` is indexed by its unique constraint.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('majors', function (Blueprint $table) {
            $table->id();
            $table->string('name', 150);
            $table->string('slug', 170)->unique();
            $table->string('excerpt', 300)->nullable();
            $table->longText('description')->nullable();
            $table->text('extra')->nullable();
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
        Schema::dropIfExists('majors');
    }
};
