<?php

namespace App\Console\Commands;

use App\Models\Property;
use App\Models\User;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class SendPendingSellerWelcomeSms extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'sms:send-pending-sellers 
                            {--dry-run : Preview recipients and messages without sending SMS}
                            {--reset-password : Generate and set a new temporary password for each seller}
                            {--limit= : Limit the number of properties to process}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Send welcome SMS to sellers whose properties were added by Advertisement Managers';

    public function handle(): int
    {
        $dryRun = $this->option('dry-run');
        $resetPassword = $this->option('reset-password');
        $limit = $this->option('limit') ? (int) $this->option('limit') : null;

        $this->info("Fetching properties created by Advertisement Managers...");

        // Query properties created by ad managers/admins that have a seller with a phone number
        $query = Property::whereNotNull('created_by_id')
            ->whereHas('user', function ($q) {
                $q->whereNotNull('phone')->where('phone', '!=', '');
            })
            ->with('user')
            ->orderBy('id', 'asc');

        if ($limit) {
            $query->limit($limit);
        }

        $properties = $query->get();
        $total = $properties->count();

        $this->info("Found {$total} properties with seller phone numbers.");

        if ($total === 0) {
            $this->warn("No pending properties found.");
            return 0;
        }

        if ($dryRun) {
            $this->warn("DRY RUN MODE ENABLED. No SMS will be sent.");
        }

        $bar = $this->output->createProgressBar($total);
        $bar->start();

        $successCount = 0;
        $failedCount = 0;

        foreach ($properties as $property) {
            $seller = $property->user;
            if (! $seller || ! $seller->phone) {
                $bar->advance();
                continue;
            }

            $plainPassword = null;
            if ($resetPassword && ! $dryRun) {
                $plainPassword = Str::password(10);
                $seller->update(['password' => Hash::make($plainPassword)]);
            }

            $sendTo = $this->normalizePhone($seller->phone);
            $frontendUrl = rtrim(config('app.frontend_url', 'http://localhost:3000'), '/');
            $listingUrl = "{$frontendUrl}/property/{$property->id}";
            $signinUrl = "{$frontendUrl}/signin";

            $listingTypeLabel = match ($property->listing_type) {
                'rent' => 'For Rent',
                'sold' => 'Sold',
                default => 'For Sale',
            };

            $priceText = $property->listing_type === 'rent' && $property->price_per_week
                ? "LKR {$property->price_per_week}/week"
                : "LKR {$property->price}";

            $loginId = $seller->email ? "Email: {$seller->email}" : "Phone: {$seller->phone}";

            if ($plainPassword) {
                $message = "Hi {$seller->name}, welcome to GreenBricks! Your listing \"{$property->title}\" "
                    . "({$listingTypeLabel}, {$property->property_type}, {$property->suburb}, {$property->state}) "
                    . "is live at {$priceText}. View it: {$listingUrl} "
                    . "Login to manage it: {$signinUrl} — {$loginId} / Password: {$plainPassword}";
            } else {
                $message = "Hi {$seller->name}, welcome to GreenBricks! Your listing \"{$property->title}\" "
                    . "({$listingTypeLabel}, {$property->property_type}, {$property->suburb}, {$property->state}) "
                    . "is live at {$priceText}. View it: {$listingUrl} "
                    . "Login via OTP to manage it: {$signinUrl} — {$loginId}";
            }

            if ($dryRun) {
                $this->newLine();
                $this->line("--------------------------------------------------");
                $this->line("Property ID : {$property->id} - {$property->title}");
                $this->line("Seller Name : {$seller->name}");
                $this->line("Phone (To)  : {$sendTo}");
                $this->line("Message     : {$message}");
                $bar->advance();
                continue;
            }

            // Send SMS via notify.lk
            try {
                $smsResponse = Http::withOptions(['verify' => ! app()->isLocal()])->post('https://app.notify.lk/api/v1/send', [
                    'user_id'   => config('services.notify_lk.user_id'),
                    'api_key'   => config('services.notify_lk.api_key'),
                    'sender_id' => config('services.notify_lk.service_id'),
                    'to'        => $sendTo,
                    'message'   => $message,
                ]);

                if ($smsResponse->successful() && $smsResponse->json('status') === 'success') {
                    $successCount++;
                } else {
                    $failedCount++;
                    Log::error("notify.lk bulk SMS failed for property #{$property->id}", [
                        'status' => $smsResponse->status(),
                        'body'   => $smsResponse->body(),
                        'to'     => $sendTo,
                    ]);
                }
            } catch (\Throwable $e) {
                $failedCount++;
                Log::error("notify.lk bulk SMS exception for property #{$property->id}: " . $e->getMessage());
            }

            // 100ms pause to respect gateway throughput/rate-limits
            usleep(100000);

            $bar->advance();
        }

        $bar->finish();
        $this->newLine();

        if ($dryRun) {
            $this->info("Dry run finished. {$total} records evaluated.");
        } else {
            $this->info("SMS sending process completed!");
            $this->line("Successful : <info>{$successCount}</info>");
            $this->line("Failed     : <error>{$failedCount}</error>");
        }

        return 0;
    }

    private function normalizePhone(string $phone): string
    {
        $digits = preg_replace('/\D/', '', $phone);
        if (str_starts_with($digits, '0')) {
            return '94' . substr($digits, 1);
        }
        if (! str_starts_with($digits, '94')) {
            return '94' . $digits;
        }
        return $digits;
    }
}
