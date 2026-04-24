<?php

namespace App\Console\Commands;

use App\Models\PropertyImage;
use App\Services\WatermarkService;
use Illuminate\Console\Command;

class WatermarkImages extends Command
{
    protected $signature   = 'images:watermark';
    protected $description = 'Apply GreenBrick watermark to all existing property images';

    public function handle(): int
    {
        $images  = PropertyImage::all();
        $service = new WatermarkService();
        $bar     = $this->output->createProgressBar($images->count());
        $bar->start();

        $ok = $fail = 0;
        foreach ($images as $image) {
            $service->apply($image->image_path) ? $ok++ : $fail++;
            $bar->advance();
        }

        $bar->finish();
        $this->newLine();
        $this->info("Done — watermarked: {$ok}, failed: {$fail}");

        return self::SUCCESS;
    }
}
