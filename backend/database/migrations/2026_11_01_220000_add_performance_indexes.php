<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('applications', function (Blueprint $table) {
            $table->index('applied_at');
            $table->index('status');
        });

        Schema::table('companies', function (Blueprint $table) {
            $table->index('user_id');
        });

        Schema::table('follow_ups', function (Blueprint $table) {
            $table->index('scheduled_at');
        });

        Schema::table('user_notifications', function (Blueprint $table) {
            $table->index(['user_id', 'read_at']);
        });
    }

    public function down(): void
    {
        Schema::table('user_notifications', fn (Blueprint $table) => $table->dropIndex(['user_id', 'read_at']));
        Schema::table('follow_ups', fn (Blueprint $table) => $table->dropIndex(['scheduled_at']));
        Schema::table('companies', fn (Blueprint $table) => $table->dropIndex(['user_id']));
        Schema::table('applications', function (Blueprint $table) {
            $table->dropIndex(['applied_at']);
            $table->dropIndex(['status']);
        });
    }
};
