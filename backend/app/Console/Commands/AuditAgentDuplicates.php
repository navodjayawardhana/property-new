<?php

namespace App\Console\Commands;

use App\Models\User;
use App\Services\AgentIdentity;
use Illuminate\Console\Command;

class AuditAgentDuplicates extends Command
{
    protected $signature = 'agents:audit-duplicates';

    protected $description = 'Report agent identity matches and name-only candidates without modifying data';

    public function handle(): int
    {
        $agents = User::where('role', 'agent')->withCount('properties')->orderBy('id')->get();
        $rows = [];
        foreach (AgentIdentity::groups($agents)->filter(fn ($group) => $group->count() > 1) as $group) {
            $rows[] = ['Name and contact match', $group->pluck('id')->implode(', '), $group->first()->name, $group->sum('properties_count')];
        }
        foreach ($agents->groupBy(fn ($agent) => AgentIdentity::name($agent->name))->filter(fn ($group) => $group->count() > 1) as $group) {
            $rows[] = ['Same name: manual review required', $group->pluck('id')->implode(', '), $group->first()->name, $group->sum('properties_count')];
        }
        $this->table(['Evidence', 'User IDs', 'Name', 'Properties'], $rows);
        $this->info('Read-only audit. No accounts or property relationships were changed.');

        return self::SUCCESS;
    }
}
