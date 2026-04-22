<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: Arial, sans-serif; background: #f4f4f4; margin: 0; padding: 0; }
    .container { max-width: 480px; margin: 40px auto; background: #fff; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.08); }
    .header { background: #121e80; padding: 32px; text-align: center; }
    .header h1 { color: #fff; margin: 0; font-size: 22px; }
    .body { padding: 32px; }
    .otp-box { background: #f0f2ff; border: 2px dashed #121e80; border-radius: 10px; text-align: center; padding: 20px; margin: 24px 0; }
    .otp-code { font-size: 40px; font-weight: 900; letter-spacing: 12px; color: #121e80; }
    .footer { text-align: center; color: #999; font-size: 12px; padding: 0 32px 24px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Greenbrick.net</h1>
    </div>
    <div class="body">
      <p>Hi <strong>{{ $name }}</strong>,</p>
      <p>Use the code below to complete your sign in. It expires in <strong>10 minutes</strong>.</p>
      <div class="otp-box">
        <div class="otp-code">{{ $otp }}</div>
      </div>
      <p>If you did not request this, you can safely ignore this email.</p>
    </div>
    <div class="footer">
      <p>Greenbrick.net &mdash; Australia's #1 Property Platform</p>
    </div>
  </div>
</body>
</html>
