<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Spektrum kurikulum (Profil > Spektrum Kurikulum).
 *
 * Deliberately not tied to `majors`: a spektrum here describes a curriculum —
 * its structure and the mata pelajaran it contains — which a school may
 * publish per kurikulum or per tahun ajaran, not necessarily one per jurusan.
 *
 * The composite index matches the public query exactly: WHERE is_active = 1
 * ORDER BY sort_order, the same shape FR7-9 already uses for jurusan.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('curriculum_spectra', function (Blueprint $table) {
            $table->id();
            $table->string('name', 150);
            $table->string('slug', 170)->unique();
            $table->text('description')->nullable();
            $table->unsignedInteger('sort_order')->default(0);
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->index(['is_active', 'sort_order']);
        });

        Schema::create('curriculum_subjects', function (Blueprint $table) {
            $table->id();
            // Cascade, not nullOnDelete: a mata pelajaran without its spektrum
            // is not an orphan worth keeping, it is a row nothing can render.
            $table->foreignId('spectrum_id')
                ->constrained('curriculum_spectra')
                ->cascadeOnDelete();
            $table->string('group', 100)->nullable();
            $table->string('name', 150);
            $table->unsignedInteger('sort_order')->default(0);
            $table->timestamps();

            $table->index(['spectrum_id', 'sort_order']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('curriculum_subjects');
        Schema::dropIfExists('curriculum_spectra');
    }
};
