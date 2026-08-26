<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Hero becomes a carousel, and each slide may point at a berita.
 *
 * This retires the "only one active hero" rule from FR5-13 / FR7-6 on the
 * school's explicit instruction: several heroes may now be active at once and
 * are shown as slides in sort_order. The cap of three lives in
 * App\Rules\MaxActiveHeroes rather than in the schema, because it is a
 * performance budget (three full-bleed images on the LCP screen) rather than
 * a data constraint.
 *
 * `post_id` is nullOnDelete, but note that Post uses SoftDeletes: "deleting" a
 * berita from the CMS only sets deleted_at and will NOT fire this. What keeps
 * a slide from linking to a withdrawn berita is Hero::postUrl(), which checks
 * published status on read.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('heroes', function (Blueprint $table) {
            $table->foreignId('post_id')
                ->nullable()
                ->after('media_id')
                ->constrained('posts')
                ->nullOnDelete();
            $table->string('post_link_text', 60)->nullable()->after('post_id');
            $table->unsignedInteger('sort_order')->default(0)->after('is_active');

            $table->index(['is_active', 'sort_order']);
        });
    }

    public function down(): void
    {
        Schema::table('heroes', function (Blueprint $table) {
            $table->dropIndex(['is_active', 'sort_order']);
            $table->dropConstrainedForeignId('post_id');
            $table->dropColumn(['post_link_text', 'sort_order']);
        });
    }
};
