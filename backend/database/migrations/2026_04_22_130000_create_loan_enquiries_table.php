<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('loan_enquiries', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('email');
            $table->string('phone')->nullable();
            $table->enum('employment_type', ['full_time', 'part_time', 'self_employed', 'casual']);
            $table->unsignedInteger('annual_income');
            $table->unsignedInteger('deposit_amount');
            $table->unsignedInteger('loan_amount');
            $table->enum('loan_purpose', ['buy_home', 'investment', 'refinance']);
            $table->string('property_type');
            $table->string('property_state', 10);
            $table->unsignedInteger('estimated_property_value')->nullable();
            $table->text('message')->nullable();
            $table->enum('status', ['new', 'in_review', 'pre_approved', 'declined'])->default('new');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('loan_enquiries');
    }
};
