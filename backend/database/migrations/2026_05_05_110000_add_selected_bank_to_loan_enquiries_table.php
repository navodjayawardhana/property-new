<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('loan_enquiries', function (Blueprint $table) {
            $table->string('selected_bank')->nullable()->after('name');
            $table->unsignedSmallInteger('loan_term')->nullable()->after('loan_amount');
            $table->string('nic_number')->nullable()->after('phone');
        });
    }

    public function down(): void
    {
        Schema::table('loan_enquiries', function (Blueprint $table) {
            $table->dropColumn(['selected_bank', 'loan_term', 'nic_number']);
        });
    }
};
