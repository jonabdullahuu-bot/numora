import { supabaseAdmin } from '@/lib/supabase';

interface SendTokenEmailParams {
  transactionId: string;
  accessToken: string;
  planLabel: string;
  creditsGranted: number;
  customerId?: string | null;
  explicitEmail?: string | null;
}

async function resolveCustomerEmailFromPaddle(
  transactionId: string,
  customerId?: string | null
): Promise<string | null> {
  const paddleApiKey = process.env.PADDLE_API_KEY?.trim();
  if (!paddleApiKey) return null;

  const isSandbox = (process.env.NEXT_PUBLIC_PADDLE_ENV || 'sandbox') === 'sandbox';
  const baseUrl = isSandbox
    ? 'https://sandbox-api.paddle.com'
    : 'https://api.paddle.com';

  try {
    let resolvedCustomerId = customerId || '';

    if (!resolvedCustomerId && transactionId) {
      const txRes = await fetch(
        `${baseUrl}/transactions/${encodeURIComponent(transactionId)}`,
        {
          headers: { Authorization: `Bearer ${paddleApiKey}` },
          cache: 'no-store',
        }
      );
      const txJson = await txRes.json().catch(() => ({}));
      const inlineEmail = txJson?.data?.customer?.email;
      if (inlineEmail && typeof inlineEmail === 'string') return inlineEmail.trim();
      resolvedCustomerId = String(txJson?.data?.customer_id || '').trim();
    }

    if (resolvedCustomerId) {
      const custRes = await fetch(
        `${baseUrl}/customers/${encodeURIComponent(resolvedCustomerId)}`,
        {
          headers: { Authorization: `Bearer ${paddleApiKey}` },
          cache: 'no-store',
        }
      );
      const custJson = await custRes.json().catch(() => ({}));
      const email = custJson?.data?.email;
      if (email && typeof email === 'string') return email.trim();
    }
  } catch (err) {
    console.warn('[Numora] Could not resolve Paddle customer email:', err);
  }

  return null;
}

export async function deliverAccessTokenEmail(params: SendTokenEmailParams): Promise<void> {
  const resendKey = process.env.RESEND_API_KEY?.trim();
  if (!resendKey) return;

  const fromEmail =
    process.env.RESEND_FROM_EMAIL?.trim() || 'NumoraLookup <receipts@numoralookup.com>';

  // Atomically claim email_sent so webhook + verify-payment never double-send
  const { data: claimed } = await supabaseAdmin
    .from('access_tokens')
    .update({ email_sent: true })
    .eq('token', params.accessToken)
    .eq('email_sent', false)
    .select('token')
    .maybeSingle();

  if (!claimed) return;

  const recipient =
    (params.explicitEmail && params.explicitEmail.trim()) ||
    (await resolveCustomerEmailFromPaddle(params.transactionId, params.customerId));

  if (!recipient) {
    // Release claim so a later webhook/verify call with email can still send
    await supabaseAdmin
      .from('access_tokens')
      .update({ email_sent: false })
      .eq('token', params.accessToken);
    return;
  }

  await supabaseAdmin
    .from('access_tokens')
    .update({ customer_email: recipient })
    .eq('token', params.accessToken);

  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background:#050811; color:#f8fafc; padding:32px 20px;">
      <div style="max-width:520px; margin:0 auto; background:#0c1120; border:1px solid #1e293b; border-radius:16px; padding:28px;">
        <div style="font-size:12px; font-weight:700; letter-spacing:0.08em; text-transform:uppercase; color:#34d399;">
          NumoraLookup · Access Pass Active
        </div>
        <h1 style="margin:10px 0 12px; font-size:22px; color:#ffffff;">
          Your Private Access Token
        </h1>
        <p style="margin:0 0 20px; font-size:14px; line-height:1.6; color:#94a3b8;">
          Thank you for your <strong style="color:#ffffff;">${params.planLabel}</strong> purchase. Save this token to access your <strong style="color:#ffffff;">${params.creditsGranted} lookup credits</strong> on any phone, tablet, or computer:
        </p>
        <div style="background:#050811; border:1px solid #334155; border-radius:12px; padding:16px; text-align:center; margin-bottom:20px;">
          <div style="font-size:11px; text-transform:uppercase; letter-spacing:0.1em; color:#64748b; margin-bottom:6px;">
            Private Access Token
          </div>
          <div style="font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-size:24px; font-weight:800; letter-spacing:0.12em; color:#34d399;">
            ${params.accessToken}
          </div>
        </div>
        <a href="https://numoralookup.com/dashboard" style="display:block; text-align:center; background:#10b981; color:#020617; font-weight:700; font-size:14px; text-decoration:none; padding:13px 18px; border-radius:10px;">
          Open Dashboard & Search Numbers
        </a>
        <p style="margin:20px 0 0; font-size:12px; line-height:1.5; color:#64748b;">
          Transaction ID: ${params.transactionId}<br/>
          Valid for 30 days (automatically extends each time you use a credit). Need help? Reply to support@numoralookup.com.
        </p>
      </div>
    </div>
  `;

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${resendKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: fromEmail,
      to: [recipient],
      subject: `Your NumoraLookup Access Token (${params.accessToken})`,
      html,
    }),
  });

  if (!res.ok) {
    const errText = await res.text().catch(() => '');
    console.error('[Numora] Resend email failed:', res.status, errText);
    await supabaseAdmin
      .from('access_tokens')
      .update({ email_sent: false })
      .eq('token', params.accessToken);
  }
}
