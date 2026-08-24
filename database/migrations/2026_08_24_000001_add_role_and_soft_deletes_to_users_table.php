<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * prd-07 §3.1 — users carries the role that FR5-2 enforces server-side.
 *
 * Added as its own migration rather than folded into the starter's
 * create_users_table so an already-migrated database picks it up without a
 * destructive refresh.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->enum('role', ['superadmin', 'editor'])
                ->default('editor')
                ->after('password');
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['role', 'deleted_at']);
        });
    }
};
