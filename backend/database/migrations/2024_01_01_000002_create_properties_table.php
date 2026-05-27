<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('properties', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('title');
            $table->unsignedBigInteger('price');
            $table->unsignedBigInteger('price_per_week')->nullable();
            $table->string('address');
            $table->string('suburb');
            $table->string('state', 10);
            $table->string('postcode', 10);
            $table->unsignedTinyInteger('beds')->default(0);
            $table->unsignedTinyInteger('baths')->default(0);
            $table->unsignedTinyInteger('cars')->default(0);
            $table->string('land_size')->nullable();
            $table->string('property_type');
            $table->enum('listing_type', ['buy', 'rent', 'sold'])->default('buy');
            $table->text('description');
            $table->string('agent_name');
            $table->string('agency_name');
            $table->date('sold_date')->nullable();
            $table->unsignedSmallInteger('days_listed')->default(0);
            $table->boolean('is_featured')->default(false);
            $table->enum('status', ['active', 'inactive', 'sold'])->default('active');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('properties');
    }
};
