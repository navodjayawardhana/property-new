<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Payment Receipt – Greenbrick.net</title>
</head>
<body style="margin:0;padding:0;background:#f4f5f7;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f5f7;padding:32px 0;">
    <tr>
      <td align="center">
        <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 1px 4px rgba(0,0,0,0.08);">

          <!-- Header -->
          <tr>
            <td style="background:#16a34a;padding:28px 32px;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="color:#ffffff;font-size:20px;font-weight:900;letter-spacing:-0.3px;">Greenbrick.net</td>
                  <td align="right">
                    <span style="background:rgba(255,255,255,0.2);color:#ffffff;font-size:11px;font-weight:700;letter-spacing:1px;padding:4px 12px;border-radius:20px;text-transform:uppercase;">Payment Receipt</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:32px;">

              <p style="margin:0 0 20px;color:#374151;font-size:14px;line-height:1.6;">
                Hi <strong>{{ $userName }}</strong>, thank you for your payment. Your listing has been published successfully.
              </p>

              <!-- Order box -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:10px;margin-bottom:24px;">
                <tr>
                  <td style="padding:16px 20px;">
                    <p style="margin:0;font-size:11px;font-weight:700;color:#16a34a;letter-spacing:1px;text-transform:uppercase;">Order / Receipt No.</p>
                    <p style="margin:6px 0 0;font-size:22px;font-weight:900;color:#14532d;letter-spacing:2px;">{{ $orderId }}</p>
                    <p style="margin:4px 0 0;font-size:12px;color:#6b7280;">{{ $paidAt }}</p>
                  </td>
                </tr>
              </table>

              <!-- Billing Details -->
              <p style="margin:0 0 10px;font-size:11px;font-weight:700;color:#9ca3af;letter-spacing:1px;text-transform:uppercase;">Billing Details</p>
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:20px;">
                <tr>
                  <td style="padding:10px 0;border-bottom:1px solid #f3f4f6;">
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td width="140" style="color:#6b7280;font-size:13px;padding-right:20px;">Name</td>
                        <td style="color:#111827;font-size:13px;font-weight:600;">{{ $userName }}</td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td style="padding:10px 0;">
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td width="140" style="color:#6b7280;font-size:13px;padding-right:20px;">Email</td>
                        <td style="font-size:13px;font-weight:600;color:#111827;">{{ $userEmail }}</td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Divider -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin:4px 0 20px;">
                <tr><td style="border-top:1px dashed #d1d5db;font-size:0;line-height:0;">&nbsp;</td></tr>
              </table>

              <!-- Listing Details -->
              <p style="margin:0 0 10px;font-size:11px;font-weight:700;color:#9ca3af;letter-spacing:1px;text-transform:uppercase;">Listing Details</p>
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:20px;">
                <tr>
                  <td style="padding:10px 0;border-bottom:1px solid #f3f4f6;">
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td width="140" style="color:#6b7280;font-size:13px;padding-right:20px;vertical-align:top;">Property</td>
                        <td style="color:#111827;font-size:13px;font-weight:600;">{{ $listingTitle }}</td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td style="padding:10px 0;border-bottom:1px solid #f3f4f6;">
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td width="140" style="color:#6b7280;font-size:13px;padding-right:20px;vertical-align:top;">Address</td>
                        <td style="color:#111827;font-size:13px;">{{ $listingAddress }}</td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td style="padding:10px 0;">
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td width="140" style="color:#6b7280;font-size:13px;padding-right:20px;">Listing Price</td>
                        <td style="color:#111827;font-size:13px;font-weight:600;">LKR {{ number_format($listingPrice) }}</td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Divider -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin:4px 0 20px;">
                <tr><td style="border-top:1px dashed #d1d5db;font-size:0;line-height:0;">&nbsp;</td></tr>
              </table>

              <!-- Payment Summary -->
              <p style="margin:0 0 10px;font-size:11px;font-weight:700;color:#9ca3af;letter-spacing:1px;text-transform:uppercase;">Payment Summary</p>
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:16px;">
                <tr>
                  <td style="padding:10px 0;border-bottom:1px solid #f3f4f6;">
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="color:#6b7280;font-size:13px;padding-right:20px;">Listing Fee (Fixed Rate)</td>
                        <td align="right" style="color:#111827;font-size:13px;font-weight:600;white-space:nowrap;">LKR {{ number_format($listingFee, 2) }}</td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td style="padding:10px 0;border-bottom:1px solid #f3f4f6;">
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="color:#6b7280;font-size:13px;padding-right:20px;">Processing Fee (3.3%)</td>
                        <td align="right" style="color:#111827;font-size:13px;font-weight:600;white-space:nowrap;">LKR {{ number_format($processingFee, 2) }}</td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Total -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background:#f9fafb;border-radius:8px;margin-bottom:16px;">
                <tr>
                  <td style="padding:14px 18px;">
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="color:#374151;font-size:14px;font-weight:700;">Total Paid</td>
                        <td align="right" style="color:#16a34a;font-size:20px;font-weight:900;white-space:nowrap;">LKR {{ number_format($paymentAmount, 2) }}</td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Status pill -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="padding:8px 0;">
                    <span style="display:inline-block;background:#dcfce7;color:#15803d;font-size:11px;font-weight:700;letter-spacing:1px;padding:5px 16px;border-radius:20px;text-transform:uppercase;">&#10003; &nbsp; Paid via PayHere</span>
                  </td>
                </tr>
              </table>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#f9fafb;border-top:1px solid #e5e7eb;padding:20px 32px;">
              <p style="margin:0;color:#9ca3af;font-size:12px;line-height:1.6;text-align:center;">
                This is an official receipt from <a href="https://greenbrick.net" style="color:#16a34a;text-decoration:none;">Greenbrick.net</a><br />
                For support, contact <a href="mailto:support@greenbrick.net" style="color:#16a34a;text-decoration:none;">support@greenbrick.net</a>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
