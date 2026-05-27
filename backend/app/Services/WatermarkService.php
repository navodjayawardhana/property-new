<?php

namespace App\Services;

class WatermarkService
{
    private const TEXT  = 'GreenBrick';
    private const FONTS = [
        'C:/Windows/Fonts/arialbd.ttf',
        'C:/Windows/Fonts/arial.ttf',
        '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf',
        '/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf',
    ];

    public function apply(string $storagePath): bool
    {
        $full = storage_path('app/public/' . $storagePath);
        if (! file_exists($full) || ! extension_loaded('gd')) return false;

        $info = @getimagesize($full);
        if (! $info) return false;

        $img = match ($info['mime']) {
            'image/jpeg' => @imagecreatefromjpeg($full),
            'image/png'  => @imagecreatefrompng($full),
            'image/webp' => @imagecreatefromwebp($full),
            default      => null,
        };
        if (! $img) return false;

        $w = imagesx($img);
        $h = imagesy($img);

        imagealphablending($img, true);

        $fontFile = $this->findFont();
        $text     = self::TEXT;
        $padding  = 14;

        if ($fontFile) {
            // Small font: 1.5% of image width, min 12px
            $fontSize = max(12, (int) ($w * 0.015));

            $bbox = imagettfbbox($fontSize, 0, $fontFile, $text);
            $tw   = abs($bbox[4] - $bbox[0]);
            $th   = abs($bbox[5] - $bbox[1]);

            $x = $w - $tw - $padding;
            $y = $h - $padding;

            // Subtle dark shadow
            $shadow = imagecolorallocatealpha($img, 0, 0, 0, 90);
            imagettftext($img, $fontSize, 0, $x + 1, $y + 1, $shadow, $fontFile, $text);

            // White semi-transparent text
            $white = imagecolorallocatealpha($img, 255, 255, 255, 40);
            imagettftext($img, $fontSize, 0, $x, $y, $white, $fontFile, $text);
        } else {
            // Fallback built-in GD font
            $fw    = imagefontwidth(3) * strlen($text);
            $fh    = imagefontheight(3);
            $x     = $w - $fw - $padding;
            $y     = $h - $fh - $padding;
            $shadow = imagecolorallocatealpha($img, 0, 0, 0, 90);
            $white  = imagecolorallocatealpha($img, 255, 255, 255, 40);
            imagestring($img, 3, $x + 1, $y + 1, $text, $shadow);
            imagestring($img, 3, $x,     $y,     $text, $white);
        }

        imagesavealpha($img, true);

        $result = match ($info['mime']) {
            'image/jpeg' => imagejpeg($img, $full, 90),
            'image/png'  => imagepng($img, $full),
            'image/webp' => imagewebp($img, $full, 90),
            default      => false,
        };

        imagedestroy($img);
        return (bool) $result;
    }

    private function findFont(): ?string
    {
        foreach (self::FONTS as $f) {
            if (file_exists($f)) return $f;
        }
        return null;
    }
}
