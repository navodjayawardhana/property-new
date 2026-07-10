<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        DB::statement("ALTER TABLE users MODIFY COLUMN role ENUM('buyer','seller','agent','admin','advertisement_manager') NOT NULL DEFAULT 'buyer'");
    }

    public function down(): void
    {
        DB::statement("ALTER TABLE users MODIFY COLUMN role ENUM('buyer','seller','agent','admin') NOT NULL DEFAULT 'buyer'");
    }
};
