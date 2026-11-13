<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Greenbricks email preferences</title></head>
<body style="font-family:Arial,sans-serif;background:#f0f2f5;color:#1e293b;padding:24px"><main style="max-width:540px;margin:40px auto;background:white;padding:28px;border-radius:16px">
<h1>Greenbricks email preferences</h1>
@if($done)<p>You have been unsubscribed from marketing emails. Pending sends will respect your preference. Essential account messages are unaffected.</p>
@else<p>Confirm that you want to stop Greenbricks marketing emails.</p><form method="post" action="{{ route('marketing.unsubscribe', ['token' => $token]) }}">@csrf<button style="background:#16a34a;color:white;border:0;border-radius:8px;padding:12px 20px">Unsubscribe</button></form>@endif
</main></body></html>
