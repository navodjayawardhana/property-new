<?php

namespace App\Observers;

use App\Models\PropertyImage;
use App\Services\WatermarkService;

class PropertyImageObserver
{
    public function created(PropertyImage $image): void
    {
        (new WatermarkService())->apply($image->image_path);
    }
}
