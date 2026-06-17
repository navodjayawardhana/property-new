<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Your Greenbrick.net Login Code</title>
</head>
<body style="margin:0;padding:0;background:#f4f5f7;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f5f7;padding:32px 0;">
    <tr>
      <td align="center">
        <table width="520" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 1px 4px rgba(0,0,0,0.08);">

          <!-- Header -->
          <tr>
            <td style="background:#16a34a;padding:24px 32px;">
              <img src="{{ env('FRONTEND_URL','https://greenbrick.net') }}/GreenBricksLogo.png"
                   alt="Greenbrick.net" height="38" style="display:block;" />
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:36px 32px 24px;">
              <p style="margin:0 0 6px;color:#6b7280;font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;">Sign-in verification</p>
              <h1 style="margin:0 0 16px;color:#111827;font-size:20px;font-weight:800;">Your login code</h1>
              <p style="margin:0 0 8px;color:#374151;font-size:14px;line-height:1.6;">
                Hi <strong>{{ $name }}</strong>, use the code below to complete your sign in. It expires in <strong>10 minutes</strong>.
              </p>

              <!-- OTP box -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin:24px 0;">
                <tr>
                  <td align="center" style="background:#f0fdf4;border:2px dashed #16a34a;border-radius:12px;padding:24px;">
                    <p style="margin:0 0 4px;color:#15803d;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1px;">One-Time Code</p>
                    <p style="margin:0;font-size:42px;font-weight:900;letter-spacing:14px;color:#15803d;font-family:monospace;">{{ $otp }}</p>
                  </td>
                </tr>
              </table>

              <p style="margin:0;color:#6b7280;font-size:13px;line-height:1.6;">
                If you did not request this code, you can safely ignore this email. Your account remains secure.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#f9fafb;border-top:1px solid #e5e7eb;padding:18px 32px;">
              <p style="margin:0;color:#9ca3af;font-size:12px;line-height:1.6;text-align:center;">
                &copy; {{ date('Y') }} <strong style="color:#6b7280;">Greenbrick.net</strong> &mdash; Sri Lanka&rsquo;s #1 Property Platform<br />
                For support contact <a href="mailto:support@greenbrick.net" style="color:#16a34a;text-decoration:none;">support@greenbrick.net</a>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
