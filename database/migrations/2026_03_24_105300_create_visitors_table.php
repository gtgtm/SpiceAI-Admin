<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('visitors', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('name');
            $table->string('company')->nullable();
            $table->string('purpose')->nullable();
            $table->string('phone')->nullable();
            $table->string('email')->nullable();
            $table->dateTime('check_in_time');
            $table->dateTime('check_out_time')->nullable();
            $table->uuid('host_employee_id')->nullable();
            $table->enum('status', [
                'checked_in', 'waiting', 'in_meeting', 'checked_out', 'cancelled'
            ])->default('checked_in');
            $table->string('badge_number')->nullable();
            $table->string('photo')->nullable();
            $table->timestamps();

            $table->foreign('host_employee_id')->references('id')->on('employees')->onDelete('set null');
            $table->index('check_in_time');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('visitors');
    }
};
