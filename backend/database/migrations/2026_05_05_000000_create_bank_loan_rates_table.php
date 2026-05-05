<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('bank_loan_rates', function (Blueprint $table) {
            $table->id();
            $table->string('bank_name');
            $table->enum('loan_type', ['variable', 'fixed', 'split', 'interest_only'])->default('variable');
            $table->decimal('interest_rate', 5, 2);
            $table->unsignedBigInteger('min_loan')->default(500000);
            $table->unsignedBigInteger('max_loan')->default(50000000);
            $table->unsignedTinyInteger('max_term')->default(30);
            $table->json('features')->nullable();
            $table->boolean('is_active')->default(true);
            $table->unsignedSmallInteger('sort_order')->default(0);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('bank_loan_rates');
    }
};
