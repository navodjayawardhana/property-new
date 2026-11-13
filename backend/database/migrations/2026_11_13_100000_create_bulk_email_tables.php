<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('marketing_contacts', function (Blueprint $t) {
            $t->id();
            $t->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $t->boolean('requires_user')->default(false);
            $t->string('email')->unique();
            $t->string('name');
            $t->string('source');
            $t->text('consent_evidence');
            $t->timestamp('consented_at')->nullable();
            $t->timestamp('unsubscribed_at')->nullable();
            $t->string('unsubscribe_token', 64)->unique();
            $t->timestamps();
        });
        Schema::create('email_suppressions', function (Blueprint $t) {
            $t->id();
            $t->string('email')->unique();
            $t->string('reason');
            $t->timestamps();
        });
        Schema::create('email_templates', function (Blueprint $t) {
            $t->id();
            $t->string('name');
            $t->string('subject');
            $t->longText('body');
            $t->timestamps();
        });
        Schema::create('email_campaigns', function (Blueprint $t) {
            $t->id();
            $t->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $t->uuid('submission_key')->unique();
            $t->foreignId('template_id')->nullable()->constrained('email_templates')->nullOnDelete();
            $t->string('name');
            $t->string('subject');
            $t->longText('body');
            $t->string('recipient_group');
            $t->json('contact_ids')->nullable();
            $t->string('status')->default('draft')->index();
            $t->timestamp('confirmed_at')->nullable();
            $t->timestamp('completed_at')->nullable();
            $t->timestamps();
        });
        Schema::create('campaign_recipients', function (Blueprint $t) {
            $t->id();
            $t->foreignId('campaign_id')->constrained('email_campaigns')->cascadeOnDelete();
            $t->foreignId('contact_id')->nullable()->constrained('marketing_contacts')->nullOnDelete();
            $t->string('email');
            $t->string('name');
            $t->string('status')->default('queued');
            $t->unsignedInteger('attempts')->default(0);
            $t->timestamp('available_at')->nullable();
            $t->timestamp('claimed_at')->nullable();
            $t->timestamp('sent_at')->nullable();
            $t->string('error')->nullable();
            $t->timestamps();
            $t->unique(['campaign_id', 'email']);
            $t->index(['campaign_id', 'status', 'available_at'], 'campaign_pending_index');
        });
        Schema::create('email_send_attempts', function (Blueprint $t) {
            $t->id();
            $t->foreignId('recipient_id')->constrained('campaign_recipients')->cascadeOnDelete();
            $t->unsignedInteger('number');
            $t->string('status');
            $t->string('error')->nullable();
            $t->timestamps();
            $t->unique(['recipient_id', 'number']);
        });
        Schema::create('email_audit_logs', function (Blueprint $t) {
            $t->id();
            $t->foreignId('actor_id')->nullable()->constrained('users')->nullOnDelete();
            $t->string('action');
            $t->string('state')->nullable();
            $t->string('entity_type');
            $t->unsignedBigInteger('entity_id')->nullable();
            $t->timestamps();
        });
    }

    public function down(): void
    {
        foreach (['email_audit_logs', 'email_send_attempts', 'campaign_recipients', 'email_campaigns', 'email_templates', 'email_suppressions', 'marketing_contacts'] as $table) {
            Schema::dropIfExists($table);
        }
    }
};
