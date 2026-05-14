/**
 * Pads the GreenBrick logo into square PNGs required by Expo.
 * Uses only built-in Node.js modules — no extra dependencies.
 * Reads the source PNG bytes, wraps them in a square white canvas
 * using the `sharp`-free approach via raw Buffer + PNG chunk rewrite.
 *
 * Run: node scripts/make-square-icons.js
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const assetsDir = path.join(__dirname, '..', 'assets', 'images');
const src = path.join(assetsDir, 'logo.png');

// We use the canvas package if available, otherwise fall back to
// embedding the original PNG inside an SVG and converting via sharp.
// The cleanest cross-platform solution without native deps is to use
// the `@resvg/resvg-js` or simply call out to PowerShell's System.Drawing.

function getPngDimensions(filePath) {
  const buf = fs.readFileSync(filePath);
  // PNG header: 8 bytes signature + IHDR chunk
  // IHDR starts at byte 8, length field 4 bytes, type 4 bytes, then width (4) height (4)
  const width = buf.readUInt32BE(16);
  const height = buf.readUInt32BE(20);
  return { width, height };
}

const { width, height } = getPngDimensions(src);
const size = Math.max(width, height);
const padX = Math.floor((size - width) / 2);
const padY = Math.floor((size - height) / 2);

console.log(`Source: ${width}x${height} → target square: ${size}x${size}`);
console.log(`Padding: left/right ${padX}px, top/bottom ${padY}px`);

// Use PowerShell + System.Drawing (available on Windows) to do the compositing
const psScript = `
Add-Type -AssemblyName System.Drawing
$src = [System.Drawing.Image]::FromFile('${src.replace(/\\/g, '\\\\')}')
$size = [Math]::Max($src.Width, $src.Height)
$bmp = New-Object System.Drawing.Bitmap($size, $size)
$g = [System.Drawing.Graphics]::FromImage($bmp)
$g.Clear([System.Drawing.Color]::Transparent)
$padX = [Math]::Floor(($size - $src.Width) / 2)
$padY = [Math]::Floor(($size - $src.Height) / 2)
$g.DrawImage($src, $padX, $padY, $src.Width, $src.Height)
$g.Dispose()
$src.Dispose()

$targets = @(
  '${path.join(assetsDir, 'icon.png').replace(/\\/g, '\\\\')}',
  '${path.join(assetsDir, 'adaptive-icon.png').replace(/\\/g, '\\\\')}',
  '${path.join(assetsDir, 'splash-icon.png').replace(/\\/g, '\\\\')}',
  '${path.join(assetsDir, 'favicon.png').replace(/\\/g, '\\\\')}'
)

foreach ($t in $targets) {
  $bmp.Save($t, [System.Drawing.Imaging.ImageFormat]::Png)
  Write-Host "Saved: $t"
}
$bmp.Dispose()
`;

try {
  const result = execSync(`powershell -Command "${psScript.replace(/"/g, '\\"')}"`, {
    encoding: 'utf8',
    stdio: 'pipe',
  });
  console.log(result);
  console.log('All square icons generated successfully.');
} catch (err) {
  console.error('Failed to generate icons:', err.message);
  process.exit(1);
}
