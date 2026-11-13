<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"></head>
<body style="margin:0;background:#f0f2f5;font-family:Arial,sans-serif;color:#1e293b">
<div style="max-width:640px;margin:auto;padding:32px 20px"><h1 style="color:#16a34a;font-size:24px">Greenbricks</h1>
@if($test)<p><strong>Test preview. No campaign recipients were contacted.</strong></p>@endif
<div style="background:white;padding:24px;border-radius:12px">{!! $safeBody !!}</div>
<p style="font-size:12px;color:#64748b">You are receiving this message because marketing consent was recorded for this address.</p>
@if($unsubscribeUrl)<p><a href="{{ $unsubscribeUrl }}">Unsubscribe from Greenbricks marketing emails</a></p>@endif
</div></body></html>
