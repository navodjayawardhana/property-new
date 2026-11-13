<?php

use App\Models\User;
use App\Services\AgentIdentity;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('agent_email_key', 64)->nullable()->unique();
            $table->string('agent_phone_key', 64)->nullable()->unique();
        });
        // Reserve each known identity once without changing/deleting legacy users.
        $seen = [];
        User::where('role', 'agent')->orderBy('id')->each(function ($user) use (&$seen) {
            $values = [];
            foreach (AgentIdentity::keys($user) as $column => $key) {
                if ($key && ! isset($seen[$column][$key])) {
                    $values[$column] = $key;
                    $seen[$column][$key] = true;
                }
            }
            if ($values) {
                DB::table('users')->where('id', $user->id)->update($values);
            }
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropUnique(['agent_email_key']);
            $table->dropUnique(['agent_phone_key']);
            $table->dropColumn(['agent_email_key', 'agent_phone_key']);
        });
    }
};
