<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: Arial, sans-serif; background: #f4f4f4; margin: 0; padding: 0; }
    .container { max-width: 520px; margin: 40px auto; background: #fff; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.08); }
    .header { background: #16a34a; padding: 28px 32px; }
    .header h1 { color: #fff; margin: 0; font-size: 20px; }
    .header p { color: rgba(255,255,255,0.8); margin: 4px 0 0; font-size: 13px; }
    .body { padding: 28px 32px; }
    .field { margin-bottom: 18px; }
    .label { font-size: 11px; font-weight: bold; color: #888; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px; }
    .value { font-size: 14px; color: #222; }
    .message-box { background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 14px; font-size: 14px; color: #333; line-height: 1.6; }
    .footer { text-align: center; color: #999; font-size: 12px; padding: 0 32px 24px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>New Contact Message</h1>
      <p>Received via Greenbrick.net contact form</p>
    </div>
    <div class="body">
      <div class="field">
        <div class="label">From</div>
        <div class="value">{{ $senderName }}</div>
      </div>
      <div class="field">
        <div class="label">Email</div>
        <div class="value"><a href="mailto:{{ $senderEmail }}" style="color:#16a34a;">{{ $senderEmail }}</a></div>
      </div>
      <div class="field">
        <div class="label">Message</div>
        <div class="message-box">{{ $body }}</div>
      </div>
    </div>
    <div class="footer">
      <p>Greenbrick.net &mdash; Sri Lanka's #1 Property Platform</p>
    </div>
  </div>
</body>
</html>
