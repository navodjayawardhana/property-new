<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('bank_loan_rates', function (Blueprint $table) {
            $table->string('logo_path')->nullable()->after('bank_name');
        });

        Schema::table('loan_enquiries', function (Blueprint $table) {
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete()->after('id');
        });
    }

    public function down(): void
    {
        Schema::table('bank_loan_rates', function (Blueprint $table) {
            $table->dropColumn('logo_path');
        });
        Schema::table('loan_enquiries', function (Blueprint $table) {
            $table->dropForeignIdFor(\App\Models\User::class);
            $table->dropColumn('user_id');
        });
    }
};
