<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('agreements', function (Blueprint $table) {
            $table->id();
            $table->string('slug');
            $table->string('version', 30);
            $table->string('title');
            $table->longText('content');
            $table->boolean('is_required')->default(true);
            $table->timestamp('published_at')->nullable();
            $table->timestamps();
            $table->unique(['slug', 'version']);
            $table->index(['slug', 'is_required', 'published_at']);
        });

        Schema::create('user_agreements', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('agreement_id')->constrained()->cascadeOnDelete();
            $table->timestamp('accepted_at');
            $table->timestamp('revoked_at')->nullable();
            $table->string('ip_address', 45)->nullable();
            $table->text('user_agent')->nullable();
            $table->timestamps();
            $table->unique(['user_id', 'agreement_id']);
            $table->index(['user_id', 'accepted_at']);
        });

        DB::table('agreements')->insert([
            [
                'slug' => 'privacy-policy',
                'version' => '1.0',
                'title' => 'Privacy Policy',
                'content' => "JobTrack collects and uses account, application, document, and activity data to provide the job application tracking service. Review and replace this text with your organization's legally approved Privacy Policy before production use.",
                'is_required' => true,
                'published_at' => now(),
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'slug' => 'terms-and-conditions',
                'version' => '1.0',
                'title' => 'Terms and Conditions',
                'content' => "By using JobTrack, you agree to use the service lawfully and keep your credentials secure. Review and replace this text with your organization's legally approved Terms and Conditions before production use.",
                'is_required' => true,
                'published_at' => now(),
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'slug' => 'cookie-policy',
                'version' => '1.0',
                'title' => 'Cookie Policy',
                'content' => "JobTrack uses browser storage required for authentication and application functionality. Review and replace this text with your organization's legally approved Cookie Policy before production use.",
                'is_required' => true,
                'published_at' => now(),
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ]);
    }

    public function down(): void
    {
        Schema::dropIfExists('user_agreements');
        Schema::dropIfExists('agreements');
    }
};
