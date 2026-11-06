export interface EmailPayload {
  to: string;
  subject: string;
  template: 'welcome' | 'invitation' | 'password_reset' | 'proposal_ready' | 'system_alert';
  variables: Record<string, any>;
  tenantBranding?: {
    companyName: string;
    primaryColor: string;
    supportEmail: string;
    logoUrl?: string;
  };
}

export interface EmailSendResult {
  success: boolean;
  provider: 'resend' | 'smtp' | 'development_mock';
  messageId: string;
  error?: string;
}

export async function sendTransactionalEmail(payload: EmailPayload): Promise<EmailSendResult> {
  const resendApiKey = process.env.RESEND_API_KEY;
  const fromEmail = process.env.EMAIL_FROM || 'no-reply@watech.agency';
  const brand = payload.tenantBranding || {
    companyName: 'Watech Intelligence',
    primaryColor: '#2563eb',
    supportEmail: 'support@watech.agency',
  };

  const htmlBody = renderEmailTemplate(payload.template, payload.variables, brand);

  // 1. If Resend API Key is configured, use Resend API
  if (resendApiKey) {
    try {
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${resendApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: `${brand.companyName} <${fromEmail}>`,
          to: payload.to,
          subject: payload.subject,
          html: htmlBody,
        }),
      });

      const resData = await response.json();
      if (!response.ok) {
        return {
          success: false,
          provider: 'resend',
          messageId: '',
          error: resData.message || 'Failed to dispatch via Resend',
        };
      }

      return {
        success: true,
        provider: 'resend',
        messageId: resData.id,
      };
    } catch (err: any) {
      return {
        success: false,
        provider: 'resend',
        messageId: '',
        error: err.message,
      };
    }
  }

  // 2. Fallback Safe Development / Preview Logger
  const simulatedId = `mock-msg-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
  console.log(`[EMAIL DISPATCH - DEV SIMULATOR] ID=${simulatedId} To=${payload.to} Subject="${payload.subject}"`);

  return {
    success: true,
    provider: 'development_mock',
    messageId: simulatedId,
  };
}

function renderEmailTemplate(
  template: EmailPayload['template'],
  vars: Record<string, any>,
  brand: NonNullable<EmailPayload['tenantBranding']>
): string {
  let content = '';

  switch (template) {
    case 'invitation':
      content = `
        <h2>You have been invited to join ${brand.companyName}</h2>
        <p>You have been assigned the role of <strong>${vars.role || 'Team Member'}</strong>.</p>
        <p><a href="${vars.inviteUrl || '#'}" style="display:inline-block;padding:12px 24px;background-color:${brand.primaryColor};color:#ffffff;text-decoration:none;border-radius:6px;font-weight:bold;">Accept Invitation</a></p>
      `;
      break;
    case 'password_reset':
      content = `
        <h2>Reset Your Password</h2>
        <p>Click the link below to securely reset your password. This link expires in 1 hour.</p>
        <p><a href="${vars.resetUrl || '#'}" style="display:inline-block;padding:12px 24px;background-color:${brand.primaryColor};color:#ffffff;text-decoration:none;border-radius:6px;font-weight:bold;">Reset Password</a></p>
      `;
      break;
    default:
      content = `
        <h2>Notification from ${brand.companyName}</h2>
        <p>${vars.message || 'You have an important update waiting in your dashboard.'}</p>
      `;
      break;
  }

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8" />
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 24px; color: #1e293b; }
          .container { max-width: 580px; margin: 0 auto; background: #ffffff; border-radius: 8px; border: 1px solid #e2e8f0; overflow: hidden; }
          .header { background-color: ${brand.primaryColor}; color: #ffffff; padding: 20px 24px; font-weight: 600; font-size: 18px; }
          .body { padding: 32px 24px; }
          .footer { padding: 16px 24px; background: #f1f5f9; font-size: 12px; color: #64748b; text-align: center; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">${brand.companyName}</div>
          <div class="body">${content}</div>
          <div class="footer">Need help? Contact <a href="mailto:${brand.supportEmail}">${brand.supportEmail}</a></div>
        </div>
      </body>
    </html>
  `;
}