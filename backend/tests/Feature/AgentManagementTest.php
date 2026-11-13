<?php

namespace Tests\Feature;

use App\Models\Property;
use App\Models\User;
use App\Services\AgentIdentity;
use App\Services\AvatarService;
use Illuminate\Database\UniqueConstraintViolationException;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\ValidationException;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class AgentManagementTest extends TestCase
{
    use RefreshDatabase;

    protected function migrateFreshUsing(): array
    {
        // SQLite already uses a string for role; the legacy MySQL ENUM widening
        // migration cannot execute on SQLite. All other real migrations run.
        return ['--path' => array_values(array_map(fn ($path) => str_replace(base_path().DIRECTORY_SEPARATOR, '', $path), array_filter(
            glob(database_path('migrations/*.php')),
            fn ($path) => ! str_contains($path, 'add_advertisement_manager_role')
        )))];
    }

    private function agent(array $attributes = []): User
    {
        return User::factory()->create(array_merge(['role' => 'agent'], $attributes));
    }

    private function legacy(User $agent, array $attributes = []): User
    {
        $data = $agent->getAttributes();
        unset($data['id']);
        $data['email'] = null;
        $data['slug'] = null;
        $data['agent_phone_key'] = null;
        $data['agent_email_key'] = null;

        return User::findOrFail(DB::table('users')->insertGetId(array_merge($data, $attributes)));
    }

    private function listing(User $agent): Property
    {
        return $agent->properties()->create(['title' => 'House', 'price' => 100, 'address' => '1 Main Street', 'suburb' => 'Colombo', 'state' => 'Western', 'postcode' => '10000', 'property_type' => 'house', 'description' => 'House for sale', 'agent_name' => $agent->name, 'agency_name' => $agent->name]);
    }

    public function test_registration_and_normalized_duplicate_prevention(): void
    {
        Mail::fake();
        $payload = ['name' => 'Example Company', 'email' => 'agent@example.com', 'password' => 'password123', 'password_confirmation' => 'password123', 'phone' => '0771234567', 'role' => 'agent'];
        $this->postJson('/api/register', $payload)->assertCreated();
        $this->postJson('/api/register', array_merge($payload, ['name' => ' EXAMPLE   COMPANY ', 'email' => 'another@example.com', 'phone' => '+94 77 123 4567']))->assertUnprocessable()->assertJsonValidationErrors('name');
        $this->assertDatabaseCount('users', 1);
    }

    public function test_same_name_without_matching_contacts_stays_separate(): void
    {
        $this->agent(['name' => 'Alex Smith', 'phone' => '0771234567']);
        $this->agent(['name' => 'Alex Smith', 'phone' => '0777654321']);
        $this->getJson('/api/agents')->assertOk()->assertJsonPath('total', 2);
    }

    public function test_legacy_group_keeps_locations_counts_and_properties_after_filtering(): void
    {
        $primary = $this->agent(['name' => 'Example Company', 'phone' => '0771234567', 'district' => 'Colombo', 'state' => 'Western']);
        $branch = $this->legacy($primary, ['name' => ' example   company ', 'phone' => '+94 77 123 4567', 'district' => 'Kandy', 'state' => 'Central']);
        $this->listing($primary);
        $this->listing($branch);
        $this->getJson('/api/agents?state=Central')->assertOk()->assertJsonPath('total', 1)->assertJsonPath('data.0.id', $primary->id)->assertJsonCount(2, 'data.0.locations')->assertJsonPath('data.0.properties_count', 2);
        $this->getJson('/api/agents/'.$branch->id)->assertOk()->assertJsonPath('id', $primary->id)->assertJsonCount(2, 'user_ids');
        $this->getJson('/api/properties?user_ids='.$primary->id.','.$branch->id)->assertOk()->assertJsonPath('total', 2);
        $this->assertDatabaseCount('users', 2);
    }

    public function test_pagination_reaches_more_than_one_hundred_agents_and_properties(): void
    {
        User::factory()->count(101)->create(['role' => 'agent']);
        $this->getJson('/api/agents?per_page=100&page=2')->assertOk()->assertJsonPath('total', 101)->assertJsonCount(1, 'data');
        $agent = User::first();
        for ($i = 0; $i < 101; $i++) {
            $this->listing($agent);
        }
        $this->getJson('/api/properties?user_id='.$agent->id.'&per_page=100&page=2')->assertOk()->assertJsonPath('total', 101)->assertJsonCount(1, 'data');
    }

    public function test_admin_can_edit_upload_replace_and_remove_an_agent_image(): void
    {
        Storage::fake('public');
        Sanctum::actingAs(User::factory()->create(['role' => 'admin']));
        $agent = $this->agent();
        $listing = $this->listing($agent);
        $url = '/api/admin/users/'.$agent->id;
        $this->postJson($url, ['name' => 'Updated Company', 'avatar' => UploadedFile::fake()->image('photo.png')])->assertOk()->assertJsonPath('name', 'Updated Company');
        $old = $agent->fresh()->getRawOriginal('avatar');
        Storage::disk('public')->assertExists($old);
        $this->postJson($url, ['avatar' => UploadedFile::fake()->image('replacement.jpg')])->assertOk();
        Storage::disk('public')->assertMissing($old);
        $new = $agent->fresh()->getRawOriginal('avatar');
        Storage::disk('public')->assertExists($new);
        $this->getJson('/api/agents/'.$agent->id)->assertJsonPath('avatar', Storage::disk('public')->url($new));
        $this->postJson($url, ['remove_avatar' => true])->assertOk()->assertJsonPath('avatar', null);
        Storage::disk('public')->assertMissing($new);
        $this->assertSame($agent->id, $listing->fresh()->user_id);
    }

    public function test_invalid_oversized_and_unauthorized_uploads_are_rejected(): void
    {
        Storage::fake('public');
        $agent = $this->agent();
        $this->postJson('/api/profile/avatar', [])->assertUnauthorized();
        Sanctum::actingAs($agent);
        $this->postJson('/api/profile/avatar', ['avatar' => UploadedFile::fake()->create('script.php', 1, 'text/plain')])->assertUnprocessable();
        $this->postJson('/api/profile/avatar', ['avatar' => UploadedFile::fake()->image('large.png')->size(2049)])->assertUnprocessable();
        $this->postJson('/api/admin/users/'.$agent->id, ['avatar' => UploadedFile::fake()->image('photo.png')])->assertForbidden();
        $this->assertEmpty(Storage::disk('public')->allFiles());
    }

    public function test_self_upload_and_replacement_work_for_supported_formats(): void
    {
        Storage::fake('public');
        $agent = $this->agent();
        Sanctum::actingAs($agent);
        foreach (['jpg', 'jpeg', 'png', 'webp'] as $extension) {
            $this->postJson('/api/profile/avatar', ['avatar' => UploadedFile::fake()->image('photo.'.$extension)])->assertOk();
            $this->assertCount(1, Storage::disk('public')->allFiles());
        }
    }

    public function test_failed_profile_update_preserves_old_image_and_cleans_new_file(): void
    {
        Storage::fake('public');
        $first = $this->agent(['name' => 'Company', 'phone' => '0771234567']);
        $other = $this->agent(['name' => 'Other', 'phone' => '0771234567']);
        Storage::disk('public')->put('avatars/old.png', 'old');
        $other->update(['avatar' => 'avatars/old.png']);
        Sanctum::actingAs(User::factory()->create(['role' => 'admin']));
        $this->postJson('/api/admin/users/'.$other->id, ['name' => $first->name, 'avatar' => UploadedFile::fake()->image('new.png')])->assertUnprocessable();
        Storage::disk('public')->assertExists('avatars/old.png');
        $this->assertCount(1, Storage::disk('public')->allFiles());
        $this->assertSame('avatars/old.png', $other->fresh()->getRawOriginal('avatar'));
    }

    public function test_database_constraints_prevent_concurrent_identity_duplicates(): void
    {
        $agent = $this->agent(['phone' => '0771234567']);
        $this->expectException(UniqueConstraintViolationException::class);
        DB::table('users')->insert(['name' => $agent->name, 'email' => 'other@example.com', 'role' => 'agent', 'agent_phone_key' => AgentIdentity::keys($agent)['agent_phone_key']]);
    }

    public function test_storage_failure_preserves_the_previous_avatar(): void
    {
        Storage::fake('public');
        Storage::disk('public')->put('avatars/old.png', 'old');
        $agent = $this->agent(['avatar' => 'avatars/old.png']);
        $file = \Mockery::mock(UploadedFile::class);
        $file->shouldReceive('store')->once()->with('avatars', 'public')->andReturn(false);
        try {
            app(AvatarService::class)->update($agent, $file);
            $this->fail('A storage failure must reject the upload.');
        } catch (ValidationException $error) {
            $this->assertArrayHasKey('avatar', $error->errors());
        }
        Storage::disk('public')->assertExists('avatars/old.png');
        $this->assertSame('avatars/old.png', $agent->fresh()->getRawOriginal('avatar'));
    }

    public function test_promoting_an_existing_user_cannot_create_a_duplicate_agent(): void
    {
        $this->agent(['name' => 'Company', 'phone' => '0771234567']);
        $seller = User::factory()->create(['name' => 'Company', 'phone' => '+94 77 123 4567', 'role' => 'seller']);
        Sanctum::actingAs(User::factory()->create(['role' => 'admin']));
        $this->patchJson('/api/admin/users/'.$seller->id, ['role' => 'agent'])->assertUnprocessable();
        $this->assertSame('seller', $seller->fresh()->role);
    }

    public function test_image_replacement_keeps_files_referenced_by_other_accounts(): void
    {
        Storage::fake('public');
        Storage::disk('public')->put('avatars/shared.png', 'shared');
        $first = $this->agent(['avatar' => 'avatars/shared.png']);
        $this->agent(['avatar' => 'avatars/shared.png']);
        app(AvatarService::class)->update($first, UploadedFile::fake()->image('new.png'));
        Storage::disk('public')->assertExists('avatars/shared.png');
    }

    public function test_blocked_agents_are_not_public_and_missing_images_use_placeholder(): void
    {
        Storage::fake('public');
        $agent = $this->agent(['is_blocked' => true, 'avatar' => 'avatars/missing.png']);
        $this->getJson('/api/agents')->assertJsonPath('total', 0);
        $this->getJson('/api/agents/'.$agent->id)->assertNotFound();
        $this->assertNull($agent->avatar);
    }

    public function test_audit_reports_without_changing_existing_data(): void
    {
        $agent = $this->agent(['phone' => '0771234567']);
        $this->legacy($agent);
        $this->artisan('agents:audit-duplicates')->expectsOutputToContain('manual review required')->assertSuccessful();
        $this->assertDatabaseCount('users', 2);
    }

    public function test_identity_migration_preserves_legacy_duplicates_and_reserves_keys(): void
    {
        $agent = $this->agent(['phone' => '0771234567']);
        $legacy = $this->legacy($agent);
        $listing = $this->listing($legacy);
        $migration = require database_path('migrations/2026_11_13_000000_add_agent_identity_keys_to_users.php');
        $migration->down();
        $migration->up();
        $this->assertDatabaseCount('users', 2);
        $this->assertSame($legacy->id, $listing->fresh()->user_id);
        $this->assertNotNull($agent->fresh()->getRawOriginal('agent_phone_key'));
        $this->assertNull($legacy->fresh()->getRawOriginal('agent_phone_key'));
        $this->getJson('/api/agents')->assertJsonPath('total', 1);
    }

    public function test_admin_adds_multiple_listings_to_existing_agent_and_duplicate_new_account_rolls_back(): void
    {
        Sanctum::actingAs(User::factory()->create(['role' => 'admin']));
        $agent = $this->agent(['name' => 'Company', 'phone' => '0771234567']);
        $payload = ['seller_mode' => 'existing', 'seller_id' => $agent->id, 'title' => 'House', 'price' => 100, 'address' => '1 Main Street', 'suburb' => 'Colombo', 'state' => 'Western', 'beds' => 3, 'baths' => 2, 'cars' => 1, 'property_type' => 'house', 'condition' => 'used', 'category' => 'domestic', 'listing_type' => 'buy', 'description' => 'House for sale'];
        $url = '/api/admin/properties/create-for-seller';
        $this->postJson($url, $payload)->assertCreated()->assertJsonPath('seller.id', $agent->id);
        $this->postJson($url, $payload)->assertCreated()->assertJsonPath('seller.id', $agent->id);
        $this->postJson($url, array_merge($payload, ['seller_mode' => 'new', 'seller_name' => ' company ', 'seller_email' => 'new@example.com', 'seller_phone' => '+94 77 123 4567', 'seller_role' => 'agent']))->assertUnprocessable();
        $this->assertSame(2, $agent->properties()->count());
        $this->assertDatabaseCount('users', 2);
        $this->assertDatabaseCount('properties', 2);
    }
}
