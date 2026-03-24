<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('appointments', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('visitor_name');
            $table->string('visitor_company')->nullable();
            $table->string('visitor_purpose')->nullable();
            $table->string('visitor_phone')->nullable();
            $table->string('visitor_email')->nullable();
            $table->uuid('employee_id');
            $table->string('employee_name');
            $table->string('employee_email');
            $table->date('date');
            $table->dateTime('start_time');
            $table->dateTime('end_time');
            $table->enum('status', [
                'scheduled', 'confirmed', 'in_progress',
                'completed', 'cancelled', 'rescheduled', 'no_show'
            ])->default('scheduled');
            $table->string('meeting_room')->nullable();
            $table->string('google_event_id')->nullable();
            $table->string('badge_number')->nullable();
            $table->enum('created_via', ['voice_kiosk', 'manual', 'walk_in'])->default('voice_kiosk');
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->foreign('employee_id')->references('id')->on('employees')->onDelete('cascade');
            $table->index(['date', 'status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('appointments');
    }
};
