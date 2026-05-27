<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->text('bio')->nullable()->after('avatar');
            $table->string('facebook')->nullable()->after('bio');
            $table->string('instagram')->nullable()->after('facebook');
            $table->string('linkedin')->nullable()->after('instagram');
            $table->string('whatsapp')->nullable()->after('linkedin');
            $table->string('twitter')->nullable()->after('whatsapp');
            $table->string('website')->nullable()->after('twitter');
            $table->string('slug')->nullable()->unique()->after('website');
        });

        // Generate slugs for existing users
        DB::table('users')->orderBy('id')->each(function ($user) {
            DB::table('users')->where('id', $user->id)->update([
                'slug' => Str::slug($user->name) . '-' . $user->id,
            ]);
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['bio', 'facebook', 'instagram', 'linkedin', 'whatsapp', 'twitter', 'website', 'slug']);
        });
    }
};
