const otpEmailTemplate = (otp, minutes) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
</head>
<body style="margin:0;padding:0;background:#f2f2ff;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="520" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #e0e0f0;">

          <!-- Header -->
          <tr>
            <td style="background:#0c0c22;padding:28px 40px;">
              <span style="color:#6f6af8;font-size:20px;font-weight:700;letter-spacing:2px;text-transform:uppercase;">MERN BLOG</span>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:40px;">
              <p style="color:#6f6af8;font-size:12px;font-weight:600;letter-spacing:1.5px;text-transform:uppercase;margin:0 0 10px;">Password Reset</p>
              <h1 style="color:#0c0c22;font-size:24px;font-weight:700;margin:0 0 16px;line-height:1.3;">Your one-time code</h1>
              <p style="color:#555577;font-size:15px;line-height:1.7;margin:0 0 32px;">
                Use the code below to reset your password. It expires in <strong style="color:#0c0c22;">${minutes} minutes</strong>.
              </p>

              <!-- OTP Box -->
              <div style="text-align:center;margin-bottom:32px;">
                <table cellpadding="0" cellspacing="0" style="display:inline-table;border-collapse:separate;border-spacing:8px;">
                  <tr>
                    ${otp.toString().split('').map(d => `
                      <td style="width:44px;height:52px;background:#f2f2ff;border:2.4px solid #6f6af8;border-radius:8px;text-align:center;vertical-align:middle;font-size:24px;font-weight:700;color:#6f6af8;font-family:'Courier New',monospace;">${d}</td>
                    `).join('')}
                  </tr>
                  <tr>
                    <td colspan="6" style="padding-top:4px;">
                      <a href="${process.env.CLIENT_URL}/otp?code=${otp}"" style="display:block;background:#6f6af8;color:#ffffff;text-decoration:none;text-align:center;padding:12px 0;border-radius:8px;font-size:14px;font-weight:600;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
                        Verify my account
                      </a>
                    </td>
                  </tr>
                </table>
              </div>
              
              <p style="color:#9999bb;font-size:13px;line-height:1.6;margin:0;">
                If you didn't request this, you can safely ignore this email. Your password won't change.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:20px 40px;border-top:1px solid #e0e0f0;background:#fafaff;">
              <p style="color:#aaaacc;font-size:12px;margin:0;">© ${new Date().getFullYear()} Mern Blog &nbsp;·&nbsp; This is an automated message</p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`

const resetConfirmTemplate = (name) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
</head>
<body style="margin:0;padding:0;background:#f2f2ff;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="520" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #e0e0f0;">

          <!-- Header -->
          <tr>
            <td style="background:#0c0c22;padding:28px 40px;">
              <span style="color:#6f6af8;font-size:20px;font-weight:700;letter-spacing:2px;text-transform:uppercase;">MERN BLOG</span>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:40px;">
              <p style="color:#6f6af8;font-size:12px;font-weight:600;letter-spacing:1.5px;text-transform:uppercase;margin:0 0 10px;">Security Notice</p>
              <h1 style="color:#0c0c22;font-size:24px;font-weight:700;margin:0 0 16px;line-height:1.3;">Password updated successfully</h1>
              <p style="color:#555577;font-size:15px;line-height:1.7;margin:0 0 28px;">
                Hi <strong style="color:#0c0c22;">${name}</strong>, your password has been changed. You're all set.
              </p>

              <!-- Warning Box -->
              <div style="background:#fff8f0;border-left:4px solid #f5a623;border-radius:0 8px 8px 0;padding:16px 20px;margin-bottom:32px;">
                <p style="color:#b36b00;font-size:13px;line-height:1.6;margin:0;">
                  If you didn't make this change, secure your account immediately by resetting your password and reviewing your recent activity.
                </p>
              </div>

              <p style="color:#9999bb;font-size:13px;line-height:1.6;margin:0;">
                This is an automated security notification. No action is needed if this was you.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:20px 40px;border-top:1px solid #e0e0f0;background:#fafaff;">
              <p style="color:#aaaacc;font-size:12px;margin:0;">© ${new Date().getFullYear()} Mern Blog &nbsp;·&nbsp; This is an automated message</p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`


const suspiciousLoginTemplate = (name, ip) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
</head>
<body style="margin:0;padding:0;background:#f2f2ff;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="520" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #e0e0f0;">

          <!-- Header -->
          <tr>
            <td style="background:#0c0c22;padding:28px 40px;">
              <span style="color:#6f6af8;font-size:20px;font-weight:700;letter-spacing:2px;text-transform:uppercase;">MERN BLOG</span>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:40px;">
              <p style="color:#e53935;font-size:12px;font-weight:600;letter-spacing:1.5px;text-transform:uppercase;margin:0 0 10px;">Security Alert</p>
              <h1 style="color:#0c0c22;font-size:24px;font-weight:700;margin:0 0 16px;line-height:1.3;">Suspicious login activity detected</h1>
              <p style="color:#555577;font-size:15px;line-height:1.7;margin:0 0 28px;">
                Hi <strong style="color:#0c0c22;">${name || 'there'}</strong>, we noticed multiple failed login attempts on your account.
              </p>

              <!-- IP Box -->
              <div style="background:#f2f2ff;border:1.5px solid #6f6af8;border-radius:8px;padding:16px 20px;margin-bottom:28px;">
                <p style="color:#555577;font-size:12px;font-weight:600;letter-spacing:1px;text-transform:uppercase;margin:0 0 6px;">IP Address</p>
                <p style="color:#6f6af8;font-size:18px;font-weight:700;font-family:'Courier New',monospace;margin:0;">${ip}</p>
              </div>

              <!-- Warning Box -->
              <div style="background:#fff8f0;border-left:4px solid #f5a623;border-radius:0 8px 8px 0;padding:16px 20px;margin-bottom:32px;">
                <p style="color:#b36b00;font-size:13px;line-height:1.6;margin:0;">
                  If this wasn't you, reset your password immediately and review your recent account activity.
                </p>
              </div>

              <p style="color:#9999bb;font-size:13px;line-height:1.6;margin:0;">
                If you made these attempts, you can safely ignore this email.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:20px 40px;border-top:1px solid #e0e0f0;background:#fafaff;">
              <p style="color:#aaaacc;font-size:12px;margin:0;">© ${new Date().getFullYear()} Mern Blog &nbsp;·&nbsp; This is an automated security notification</p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`

export { otpEmailTemplate, resetConfirmTemplate, suspiciousLoginTemplate }