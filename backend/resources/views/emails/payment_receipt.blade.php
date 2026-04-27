<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: Arial, sans-serif; background: #f4f4f4; }
    .wrap { max-width: 560px; margin: 40px auto; background: #fff; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.08); }
    .header { background: #16a34a; padding: 28px 32px; display: flex; align-items: center; justify-content: space-between; }
    .header h1 { color: #fff; font-size: 20px; font-weight: 900; }
    .header .badge { background: rgba(255,255,255,0.2); color: #fff; font-size: 11px; font-weight: 700; letter-spacing: 1px; padding: 4px 10px; border-radius: 20px; text-transform: uppercase; }
    .body { padding: 32px; }
    .order-box { background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 10px; padding: 16px 20px; margin-bottom: 24px; }
    .order-label { font-size: 11px; font-weight: 700; color: #16a34a; letter-spacing: 1px; text-transform: uppercase; }
    .order-id { font-size: 22px; font-weight: 900; color: #14532d; letter-spacing: 2px; margin-top: 4px; }
    .order-date { font-size: 12px; color: #6b7280; margin-top: 4px; }
    .section-title { font-size: 11px; font-weight: 700; color: #9ca3af; letter-spacing: 1px; text-transform: uppercase; margin-bottom: 8px; }
    .detail-row { display: flex; justify-content: space-between; font-size: 13px; padding: 6px 0; border-bottom: 1px solid #f3f4f6; color: #374151; }
    .detail-row:last-child { border-bottom: none; }
    .detail-row .label { color: #6b7280; }
    .divider { border: none; border-top: 1px dashed #d1d5db; margin: 20px 0; }
    .total-row { display: flex; justify-content: space-between; align-items: center; padding: 12px 16px; background: #f9fafb; border-radius: 8px; }
    .total-label { font-size: 13px; font-weight: 700; color: #374151; }
    .total-amount { font-size: 20px; font-weight: 900; color: #16a34a; }
    .status-pill { display: inline-block; background: #dcfce7; color: #15803d; font-size: 11px; font-weight: 700; letter-spacing: 1px; padding: 4px 12px; border-radius: 20px; text-transform: uppercase; margin-top: 16px; }
    .footer { background: #f9fafb; padding: 20px 32px; text-align: center; font-size: 12px; color: #9ca3af; border-top: 1px solid #f3f4f6; }
    .footer a { color: #16a34a; text-decoration: none; }
  </style>
</head>
<body>
  <div class="wrap">
    <div class="header">
      <h1>Greenbrick.net</h1>
      <span class="badge">Payment Receipt</span>
    </div>

    <div class="body">
      <p style="font-size:14px;color:#374151;margin-bottom:20px;">
        Hi <strong>{{ $userName }}</strong>, thank you for your payment. Your listing has been published successfully.
      </p>

      <div class="order-box">
        <div class="order-label">Order / Receipt No.</div>
        <div class="order-id">{{ $orderId }}</div>
        <div class="order-date">{{ $paidAt }}</div>
      </div>

      <div class="section-title">Billing Details</div>
      <div class="detail-row">
        <span class="label">Name</span>
        <span>{{ $userName }}</span>
      </div>
      <div class="detail-row">
        <span class="label">Email</span>
        <span>{{ $userEmail }}</span>
      </div>

      <hr class="divider">

      <div class="section-title">Listing Details</div>
      <div class="detail-row">
        <span class="label">Property</span>
        <span style="text-align:right;max-width:60%;">{{ $listingTitle }}</span>
      </div>
      <div class="detail-row">
        <span class="label">Address</span>
        <span style="text-align:right;max-width:60%;">{{ $listingAddress }}</span>
      </div>
      <div class="detail-row">
        <span class="label">Listing Price</span>
        <span>LKR {{ number_format($listingPrice) }}</span>
      </div>

      <hr class="divider">

      <div class="section-title">Payment Summary</div>
      <div class="detail-row">
        <span class="label">Listing Fee (Fixed Rate)</span>
        <span>LKR {{ number_format($paymentAmount, 2) }}</span>
      </div>

      <div class="total-row" style="margin-top:12px;">
        <span class="total-label">Total Paid</span>
        <span class="total-amount">LKR {{ number_format($paymentAmount, 2) }}</span>
      </div>

      <div style="text-align:center;">
        <span class="status-pill">&#10003; Paid via PayHere</span>
      </div>
    </div>

    <div class="footer">
      <p>This is an official receipt from <a href="https://greenbrick.net">Greenbrick.net</a></p>
      <p style="margin-top:4px;">For support, contact <a href="mailto:support@greenbrick.net">support@greenbrick.net</a></p>
    </div>
  </div>
</body>
</html>
