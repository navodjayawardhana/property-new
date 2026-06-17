<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>New Inquiry – Greenbrick.net</title>
</head>
<body style="margin:0;padding:0;background:#f4f5f7;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f5f7;padding:32px 0;">
    <tr>
      <td align="center">
        <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 1px 4px rgba(0,0,0,0.08);">

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
                    <span style="background:rgba(255,255,255,0.2);color:#ffffff;font-size:11px;font-weight:700;letter-spacing:0.8px;padding:4px 12px;border-radius:20px;text-transform:uppercase;">Property Inquiry</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:32px;">
              <p style="margin:0 0 4px;color:#6b7280;font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;">New inquiry received</p>
              <h1 style="margin:0 0 24px;color:#111827;font-size:20px;font-weight:800;line-height:1.3;">
                {{ $property->address }}<br />
                <span style="color:#6b7280;font-size:14px;font-weight:500;">{{ $property->suburb }}, {{ $property->state }} &nbsp; {{ $property->postcode }}</span>
              </h1>

              <!-- Property summary box -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;margin-bottom:24px;">
                <tr>
                  <td style="padding:16px;">
                    <p style="margin:0 0 8px;color:#15803d;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.4px;">Property</p>
                    <p style="margin:0 0 4px;color:#111827;font-size:14px;font-weight:700;">{{ $property->title }}</p>
                    <p style="margin:0;color:#6b7280;font-size:13px;">
                      {{ ucfirst($property->listing_type) }} &middot; {{ $property->property_type }} &middot; Rs {{ number_format($property->price) }}
                    </p>
                  </td>
                </tr>
              </table>

              <!-- Inquiry details -->
              <p style="margin:0 0 12px;color:#111827;font-size:14px;font-weight:700;">Inquiry Details</p>
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:20px;">
                <tr>
                  <td style="padding:11px 0;border-bottom:1px solid #f3f4f6;">
                    <table width="100%" cellpadding="0" cellspacing="0"><tr>
                      <td width="130" style="color:#6b7280;font-size:13px;padding-right:20px;">From</td>
                      <td style="color:#111827;font-size:13px;font-weight:600;">{{ $inquiry->name }}</td>
                    </tr></table>
                  </td>
                </tr>
                <tr>
                  <td style="padding:11px 0;border-bottom:1px solid #f3f4f6;">
                    <table width="100%" cellpadding="0" cellspacing="0"><tr>
                      <td width="130" style="color:#6b7280;font-size:13px;padding-right:20px;">Email</td>
                      <td style="font-size:13px;"><a href="mailto:{{ $inquiry->email }}" style="color:#16a34a;font-weight:600;text-decoration:none;">{{ $inquiry->email }}</a></td>
                    </tr></table>
                  </td>
                </tr>
                @if($inquiry->phone)
                <tr>
                  <td style="padding:11px 0;border-bottom:1px solid #f3f4f6;">
                    <table width="100%" cellpadding="0" cellspacing="0"><tr>
                      <td width="130" style="color:#6b7280;font-size:13px;padding-right:20px;">Phone</td>
                      <td style="font-size:13px;"><a href="tel:{{ $inquiry->phone }}" style="color:#16a34a;font-weight:600;text-decoration:none;">{{ $inquiry->phone }}</a></td>
                    </tr></table>
                  </td>
                </tr>
                @endif
                <tr>
                  <td style="padding:11px 0;border-bottom:1px solid #f3f4f6;">
                    <table width="100%" cellpadding="0" cellspacing="0"><tr>
                      <td width="130" style="color:#6b7280;font-size:13px;padding-right:20px;">Inquiry type</td>
                      <td style="color:#111827;font-size:13px;font-weight:600;text-transform:capitalize;">{{ $inquiry->inquiry_type }}</td>
                    </tr></table>
                  </td>
                </tr>
                <tr>
                  <td style="padding:11px 0;">
                    <table width="100%" cellpadding="0" cellspacing="0"><tr>
                      <td width="130" style="color:#6b7280;font-size:13px;padding-right:20px;vertical-align:top;padding-top:2px;">Received</td>
                      <td style="color:#111827;font-size:13px;">{{ $inquiry->created_at->format('d M Y, g:i A') }}</td>
                    </tr></table>
                  </td>
                </tr>
              </table>

              <!-- Message -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background:#f0fdf4;border-left:3px solid #16a34a;border-radius:0 8px 8px 0;margin-bottom:24px;">
                <tr>
                  <td style="padding:16px;">
                    <p style="margin:0 0 6px;color:#15803d;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;">Message</p>
                    <p style="margin:0;color:#374151;font-size:14px;line-height:1.6;">{{ $inquiry->message }}</p>
                  </td>
                </tr>
              </table>

              <!-- CTA -->
              <a href="mailto:{{ $inquiry->email }}"
                 style="display:inline-block;background:#16a34a;color:#ffffff;font-size:13px;font-weight:700;padding:12px 24px;border-radius:8px;text-decoration:none;margin-right:8px;">
                Reply to {{ $inquiry->name }}
              </a>
              @if($inquiry->phone)
              <a href="tel:{{ $inquiry->phone }}"
                 style="display:inline-block;background:#f3f4f6;color:#374151;font-size:13px;font-weight:700;padding:12px 24px;border-radius:8px;text-decoration:none;">
                Call {{ $inquiry->phone }}
              </a>
              @endif
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#f9fafb;border-top:1px solid #e5e7eb;padding:18px 32px;">
              <p style="margin:0;color:#9ca3af;font-size:12px;line-height:1.6;text-align:center;">
                &copy; {{ date('Y') }} <strong style="color:#6b7280;">Greenbrick.net</strong> &mdash; Sri Lanka&rsquo;s #1 Property Platform<br />
                You received this because someone submitted an inquiry on your listing.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
