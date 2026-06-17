<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>New Contact Message – Greenbrick.net</title>
</head>
<body style="margin:0;padding:0;background:#f4f5f7;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f5f7;padding:32px 0;">
    <tr>
      <td align="center">
        <table width="520" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 1px 4px rgba(0,0,0,0.08);">

          <!-- Header -->
          <tr>
            <td style="background:#16a34a;padding:24px 32px;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td>
                    <img src="{{ env('FRONTEND_URL','https://greenbrick.net') }}/GreenBricksLogo.png"
                         alt="Greenbrick.net" height="38" style="display:block;" />
                  </td>
                  <td align="right">
                    <span style="background:rgba(255,255,255,0.2);color:#ffffff;font-size:11px;font-weight:700;letter-spacing:0.8px;padding:4px 12px;border-radius:20px;text-transform:uppercase;">Contact Form</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:32px;">
              <p style="margin:0 0 4px;color:#6b7280;font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;">New message received</p>
              <h1 style="margin:0 0 24px;color:#111827;font-size:20px;font-weight:800;">Contact Form Submission</h1>

              <!-- From -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:16px;">
                <tr>
                  <td style="padding:11px 0;border-bottom:1px solid #f3f4f6;">
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td width="120" style="color:#6b7280;font-size:13px;padding-right:20px;">From</td>
                        <td style="color:#111827;font-size:13px;font-weight:600;">{{ $senderName }}</td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td style="padding:11px 0;border-bottom:1px solid #f3f4f6;">
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td width="120" style="color:#6b7280;font-size:13px;padding-right:20px;">Email</td>
                        <td style="font-size:13px;">
                          <a href="mailto:{{ $senderEmail }}" style="color:#16a34a;font-weight:600;text-decoration:none;">{{ $senderEmail }}</a>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Message -->
              <p style="margin:0 0 10px;color:#111827;font-size:14px;font-weight:700;">Message</p>
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
                <tr>
                  <td style="background:#f0fdf4;border-left:3px solid #16a34a;border-radius:0 8px 8px 0;padding:16px;">
                    <p style="margin:0;color:#374151;font-size:14px;line-height:1.7;">{{ $body }}</p>
                  </td>
                </tr>
              </table>

              <!-- Reply CTA -->
              <a href="mailto:{{ $senderEmail }}"
                 style="display:inline-block;background:#16a34a;color:#ffffff;font-size:13px;font-weight:700;padding:12px 24px;border-radius:8px;text-decoration:none;">
                Reply to {{ $senderName }}
              </a>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#f9fafb;border-top:1px solid #e5e7eb;padding:18px 32px;">
              <p style="margin:0;color:#9ca3af;font-size:12px;line-height:1.6;text-align:center;">
                &copy; {{ date('Y') }} <strong style="color:#6b7280;">Greenbrick.net</strong> &mdash; Sri Lanka&rsquo;s #1 Property Platform<br />
                This message was submitted via the Greenbrick.net contact form.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
