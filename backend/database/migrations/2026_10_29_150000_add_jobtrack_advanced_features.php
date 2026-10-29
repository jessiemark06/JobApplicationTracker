<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('applications', function (Blueprint $table) {
            $table->string('source')->nullable();
            $table->longText('job_description')->nullable();
        });

        Schema::table('companies', function (Blueprint $table) {
            $table->text('application_instructions')->nullable();
            $table->text('recruitment_notes')->nullable();
        });

        Schema::create('application_status_histories', function (Blueprint $table) {
            $table->id();
            $table->foreignId('application_id')->constrained()->cascadeOnDelete();
            $table->string('previous_status')->nullable();
            $table->string('new_status');
            $table->text('notes')->nullable();
            $table->timestamp('recorded_at');
            $table->timestamps();
            $table->index(['application_id', 'recorded_at']);
        });

        Schema::create('follow_ups', function (Blueprint $table) {
            $table->id();
            $table->foreignId('application_id')->constrained()->cascadeOnDelete();
            $table->timestamp('scheduled_at');
            $table->timestamp('completed_at')->nullable();
            $table->text('notes')->nullable();
            $table->text('message_template')->nullable();
            $table->timestamps();
            $table->index(['application_id', 'scheduled_at']);
            $table->index(['completed_at', 'scheduled_at']);
        });

        Schema::create('user_skills', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('name');
            $table->string('status')->default('need_to_learn');
            $table->date('target_date')->nullable();
            $table->string('evidence_url')->nullable();
            $table->timestamps();
            $table->unique(['user_id', 'name']);
        });

        Schema::create('saved_job_requirements', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('application_id')->nullable()->constrained()->nullOnDelete();
            $table->string('job_title');
            $table->string('company_name')->nullable();
            $table->longText('description')->nullable();
            $table->json('required_skills');
            $table->timestamps();
            $table->index(['user_id', 'created_at']);
        });

        Schema::create('application_documents', function (Blueprint $table) {
            $table->id();
            $table->foreignId('application_id')->constrained()->cascadeOnDelete();
            $table->string('type');
            $table->string('original_name');
            $table->string('mime_type');
            $table->unsignedBigInteger('size');
            $table->string('disk');
            $table->string('path');
            $table->timestamps();
            $table->index(['application_id', 'type']);
        });

        Schema::create('company_research_entries', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->constrained()->cascadeOnDelete();
            $table->string('category');
            $table->text('content');
            $table->string('source_url')->nullable();
            $table->date('source_date')->nullable();
            $table->timestamps();
            $table->index(['company_id', 'category']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('company_research_entries');
        Schema::dropIfExists('application_documents');
        Schema::dropIfExists('saved_job_requirements');
        Schema::dropIfExists('user_skills');
        Schema::dropIfExists('follow_ups');
        Schema::dropIfExists('application_status_histories');

        Schema::table('companies', function (Blueprint $table) {
            $table->dropColumn(['application_instructions', 'recruitment_notes']);
        });

        Schema::table('applications', function (Blueprint $table) {
            $table->dropColumn(['source', 'job_description']);
        });
    }
};
