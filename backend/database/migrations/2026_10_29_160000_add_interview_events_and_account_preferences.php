<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
   
public function up(): void
{
    if (!Schema::hasColumn('users', 'timezone')) {
        Schema::table('users', function (Blueprint $table) {
            $table->string('timezone')->nullable();
        });
    }

    if (!Schema::hasColumn('users', 'notification_preferences')) {
        Schema::table('users', function (Blueprint $table) {
            $table->json('notification_preferences')->nullable();
        });
    }

    if (!Schema::hasTable('recruitment_events')) {
        Schema::create('recruitment_events', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('application_id')->constrained()->cascadeOnDelete();
            $table->string('event_type', 80);
            $table->dateTime('starts_at');
            $table->dateTime('ends_at')->nullable();
            $table->string('timezone', 80)->default('UTC');
            $table->string('mode', 20)->nullable();
            $table->string('location')->nullable();
            $table->string('contact_name')->nullable();
            $table->string('contact_email')->nullable();
            $table->text('preparation_notes')->nullable();
            $table->json('required_documents')->nullable();
            $table->string('status', 20)->default('scheduled');
            $table->text('outcome')->nullable();
            $table->text('event_notes')->nullable();
            $table->json('reminder_intervals')->nullable();
            $table->timestamps();
            $table->index(['user_id', 'starts_at', 'status']);
        });
    }

    if (!Schema::hasTable('recruitment_event_histories')) {
        Schema::create('recruitment_event_histories', function (Blueprint $table) {
            $table->id();
            $table->foreignId('recruitment_event_id')
                ->constrained('recruitment_events')->cascadeOnDelete();
            $table->string('action', 30);
            $table->json('previous_values')->nullable();
            $table->json('new_values')->nullable();
            $table->timestamps();
            $table->index(['recruitment_event_id', 'created_at']);
        });
    }

    if (!Schema::hasTable('user_notifications')) {
        Schema::create('user_notifications', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('recruitment_event_id')
                ->nullable()->constrained('recruitment_events')->nullOnDelete();
            $table->foreignId('application_id')
                ->nullable()->constrained()->nullOnDelete();
            $table->string('type', 40);
            $table->string('title');
            $table->text('message');
            $table->string('destination')->nullable();
            $table->string('dedupe_key')->nullable()->unique();
            $table->string('email_status', 20)->default('not_requested');
            $table->timestamp('email_attempted_at')->nullable();
            $table->text('email_error')->nullable();
            $table->timestamp('read_at')->nullable();
            $table->timestamps();
            $table->index(['user_id', 'read_at', 'created_at']);
        });
    }

    if (!Schema::hasTable('event_reminder_deliveries')) {
        Schema::create('event_reminder_deliveries', function (Blueprint $table) {
            $table->id();
            $table->foreignId('recruitment_event_id')
                ->constrained('recruitment_events')->cascadeOnDelete();
            $table->dateTime('event_starts_at');
            $table->unsignedSmallInteger('minutes_before');
            $table->foreignId('notification_id')
                ->nullable()->constrained('user_notifications')->nullOnDelete();
            $table->string('email_status', 20)->default('not_requested');
            $table->timestamp('email_attempted_at')->nullable();
            $table->text('email_error')->nullable();
            $table->timestamps();
            $table->unique(
                ['recruitment_event_id', 'event_starts_at', 'minutes_before'],
                'event_reminder_once'
            );
        });
    }

    if (!Schema::hasTable('follow_up_reminder_deliveries')) {
        Schema::create('follow_up_reminder_deliveries', function (Blueprint $table) {
            $table->id();
            $table->foreignId('follow_up_id')
                ->constrained('follow_ups')->cascadeOnDelete();
            $table->dateTime('scheduled_at');
            $table->foreignId('notification_id')
                ->nullable()->constrained('user_notifications')->nullOnDelete();
            $table->string('email_status', 20)->default('not_requested');
            $table->timestamp('email_attempted_at')->nullable();
            $table->text('email_error')->nullable();
            $table->timestamps();
            $table->unique(
                ['follow_up_id', 'scheduled_at'],
                'follow_up_reminder_once'
            );
        });
    }
}

public function down(): void
{
    Schema::dropIfExists('follow_up_reminder_deliveries');
    Schema::dropIfExists('event_reminder_deliveries');
    Schema::dropIfExists('user_notifications');
    Schema::dropIfExists('recruitment_event_histories');
    Schema::dropIfExists('recruitment_events');

    // Do not drop timezone or notification_preferences here:
    // they may have existed before this migration.
}

};
