<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
       Schema::create('applications', function (Blueprint $table) {
            $table->id();

            $table->foreignId('company_id')
                ->constrained()
                ->cascadeOnDelete();

            $table->string('job_title');

            $table->string('status')->default('Applied');

            $table->date('applied_at')->nullable();

            $table->string('job_url')->nullable();

            $table->string('contact_name')->nullable();

            $table->string('contact_role')->nullable();

            $table->string('contact_email')->nullable();

            $table->string('contact_phone')->nullable();

            $table->text('notes')->nullable();

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('applications');
    }
};
