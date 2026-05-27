<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('settings', function (Blueprint $table) {
            $table->string('key')->primary();
            $table->decimal('value', 10, 2)->default(0);
        });

        DB::table('settings')->insert([
            ['key' => 'listing_fee',        'value' => 1000.00],
            ['key' => 'processing_fee_pct', 'value' => 3.30],
            ['key' => 'commission_pct',     'value' => 0.00],
        ]);
    }

    public function down(): void
    {
        Schema::dropIfExists('settings');
    }
};
