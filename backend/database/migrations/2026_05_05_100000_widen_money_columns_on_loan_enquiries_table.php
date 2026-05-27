<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('loan_enquiries', function (Blueprint $table) {
            $table->unsignedBigInteger('annual_income')->change();
            $table->unsignedBigInteger('deposit_amount')->change();
            $table->unsignedBigInteger('loan_amount')->change();
            $table->unsignedBigInteger('estimated_property_value')->nullable()->change();
        });
    }

    public function down(): void
    {
        Schema::table('loan_enquiries', function (Blueprint $table) {
            $table->unsignedInteger('annual_income')->change();
            $table->unsignedInteger('deposit_amount')->change();
            $table->unsignedInteger('loan_amount')->change();
            $table->unsignedInteger('estimated_property_value')->nullable()->change();
        });
    }
};
