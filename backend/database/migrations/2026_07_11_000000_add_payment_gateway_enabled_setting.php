<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        DB::table('settings')->updateOrInsert(
            ['key' => 'payment_gateway_enabled'],
            ['value' => 1.00]
        );
    }

    public function down(): void
    {
        DB::table('settings')->where('key', 'payment_gateway_enabled')->delete();
    }
};
