<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>New Loan Enquiry – Greenbrick.net</title>
</head>
<body style="margin:0;padding:0;background:#f4f5f7;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f5f7;padding:32px 0;">
    <tr>
      <td align="center">
        <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 1px 4px rgba(0,0,0,0.08);">

          <!-- Header -->
          <tr>
            <td style="background:#16a34a;padding:28px 32px;">
              <p style="margin:0;color:#ffffff;font-size:20px;font-weight:800;letter-spacing:-0.3px;">Greenbrick.net</p>
              <p style="margin:6px 0 0;color:#bbf7d0;font-size:13px;">Home Loan Enquiry Notification</p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:32px;">
              <p style="margin:0 0 4px;color:#6b7280;font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;">New loan enquiry received</p>
              <h1 style="margin:0 0 24px;color:#111827;font-size:20px;font-weight:800;line-height:1.3;">
                {{ $enquiry->name }}
                @if($enquiry->selected_bank)
                <br /><span style="color:#6b7280;font-size:14px;font-weight:500;">Applied for: {{ $enquiry->selected_bank }}</span>
                @endif
              </h1>

              <!-- Loan summary box -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;margin-bottom:24px;">
                <tr>
                  <td style="padding:16px;">
                    <p style="margin:0 0 10px;color:#15803d;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.4px;">Loan Details</p>
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td width="160" style="color:#6b7280;font-size:13px;padding-bottom:6px;">Loan Amount</td>
                        <td style="color:#111827;font-size:13px;font-weight:700;padding-bottom:6px;">LKR {{ number_format($enquiry->loan_amount) }}</td>
                      </tr>
                      <tr>
                        <td width="160" style="color:#6b7280;font-size:13px;padding-bottom:6px;">Loan Term</td>
                        <td style="color:#111827;font-size:13px;font-weight:700;padding-bottom:6px;">{{ $enquiry->loan_term ?? '—' }} years</td>
                      </tr>
                      <tr>
                        <td width="160" style="color:#6b7280;font-size:13px;padding-bottom:6px;">Deposit</td>
                        <td style="color:#111827;font-size:13px;font-weight:700;padding-bottom:6px;">LKR {{ number_format($enquiry->deposit_amount) }}</td>
                      </tr>
                      <tr>
                        <td width="160" style="color:#6b7280;font-size:13px;padding-bottom:6px;">Purpose</td>
                        <td style="color:#111827;font-size:13px;font-weight:700;padding-bottom:6px;text-transform:capitalize;">{{ str_replace('_', ' ', $enquiry->loan_purpose) }}</td>
                      </tr>
                      @if($enquiry->estimated_property_value)
                      <tr>
                        <td width="160" style="color:#6b7280;font-size:13px;">Property Value</td>
                        <td style="color:#111827;font-size:13px;font-weight:700;">LKR {{ number_format($enquiry->estimated_property_value) }}</td>
                      </tr>
                      @endif
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Applicant details -->
              <p style="margin:0 0 12px;color:#111827;font-size:14px;font-weight:700;">Applicant Details</p>

              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:16px;">
                <tr>
                  <td style="padding:11px 0;border-bottom:1px solid #f3f4f6;">
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td width="150" style="color:#6b7280;font-size:13px;padding-right:20px;">Name</td>
                        <td style="color:#111827;font-size:13px;font-weight:600;">{{ $enquiry->name }}</td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td style="padding:11px 0;border-bottom:1px solid #f3f4f6;">
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td width="150" style="color:#6b7280;font-size:13px;padding-right:20px;">Email</td>
                        <td style="font-size:13px;"><a href="mailto:{{ $enquiry->email }}" style="color:#16a34a;font-weight:600;text-decoration:none;">{{ $enquiry->email }}</a></td>
                      </tr>
                    </table>
                  </td>
                </tr>
                @if($enquiry->phone)
                <tr>
                  <td style="padding:11px 0;border-bottom:1px solid #f3f4f6;">
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td width="150" style="color:#6b7280;font-size:13px;padding-right:20px;">Phone</td>
                        <td style="font-size:13px;"><a href="tel:{{ $enquiry->phone }}" style="color:#16a34a;font-weight:600;text-decoration:none;">{{ $enquiry->phone }}</a></td>
                      </tr>
                    </table>
                  </td>
                </tr>
                @endif
                @if($enquiry->nic_number)
                <tr>
                  <td style="padding:11px 0;border-bottom:1px solid #f3f4f6;">
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td width="150" style="color:#6b7280;font-size:13px;padding-right:20px;">NIC</td>
                        <td style="color:#111827;font-size:13px;font-weight:600;">{{ $enquiry->nic_number }}</td>
                      </tr>
                    </table>
                  </td>
                </tr>
                @endif
                <tr>
                  <td style="padding:11px 0;border-bottom:1px solid #f3f4f6;">
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td width="150" style="color:#6b7280;font-size:13px;padding-right:20px;">Employment</td>
                        <td style="color:#111827;font-size:13px;font-weight:600;text-transform:capitalize;">{{ str_replace('_', ' ', $enquiry->employment_type) }}</td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td style="padding:11px 0;border-bottom:1px solid #f3f4f6;">
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td width="150" style="color:#6b7280;font-size:13px;padding-right:20px;">Annual Income</td>
                        <td style="color:#111827;font-size:13px;font-weight:600;">LKR {{ number_format($enquiry->annual_income) }}</td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td style="padding:11px 0;border-bottom:1px solid #f3f4f6;">
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td width="150" style="color:#6b7280;font-size:13px;padding-right:20px;">Property Type</td>
                        <td style="color:#111827;font-size:13px;font-weight:600;text-transform:capitalize;">{{ $enquiry->property_type }}</td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td style="padding:11px 0;">
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td width="150" style="color:#6b7280;font-size:13px;padding-right:20px;">District</td>
                        <td style="color:#111827;font-size:13px;font-weight:600;">{{ $enquiry->property_state }}</td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              @if($enquiry->message)
              <!-- Message box -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background:#f0fdf4;border-left:3px solid #16a34a;border-radius:0 8px 8px 0;margin-bottom:24px;">
                <tr>
                  <td style="padding:16px;">
                    <p style="margin:0 0 6px;color:#15803d;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;">Additional Notes</p>
                    <p style="margin:0;color:#374151;font-size:14px;line-height:1.6;">{{ $enquiry->message }}</p>
                  </td>
                </tr>
              </table>
              @endif

              <!-- Received timestamp -->
              <p style="margin:0 0 24px;color:#9ca3af;font-size:12px;">Received: {{ $enquiry->created_at->format('d M Y, g:i A') }}</p>

              <!-- CTA -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td>
                    <a href="mailto:{{ $enquiry->email }}"
                       style="display:inline-block;background:#16a34a;color:#ffffff;font-size:13px;font-weight:700;padding:12px 24px;border-radius:8px;text-decoration:none;margin-right:8px;">
                      Reply to {{ $enquiry->name }}
                    </a>
                    @if($enquiry->phone)
                    <a href="tel:{{ $enquiry->phone }}"
                       style="display:inline-block;background:#f3f4f6;color:#374151;font-size:13px;font-weight:700;padding:12px 24px;border-radius:8px;text-decoration:none;">
                      Call {{ $enquiry->phone }}
                    </a>
                    @endif
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#f9fafb;border-top:1px solid #e5e7eb;padding:20px 32px;">
              <p style="margin:0;color:#9ca3af;font-size:12px;line-height:1.5;">
                This email was sent by <strong>Greenbrick.net</strong> because a user submitted a home loan enquiry.<br />
                You are receiving this as the site administrator.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
