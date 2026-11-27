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

  const text = [
    'NumoraLookup, Access Pass Active',
    '',
    `Plan: ${params.planLabel} (${params.creditsGranted} lookup credits)`,
    `Private Access Token: ${params.accessToken}`,
    '',
    'Use your token on any device:',
    '1. Open https://numoralookup.com/dashboard (or https://numoralookup.com/pricing)',
    `2. Paste your token (${params.accessToken}) to restore credits and view unlocked reports`,
    '',
    `Transaction ID: ${params.transactionId}`,
    'Validity: 30 days (automatically extends each time you use a credit).',
    'Support: support@numoralookup.com',
  ].join('\n');

  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background:#050811; color:#f8fafc; padding:32px 16px;">
      <div style="max-width:540px; margin:0 auto; background:#0c1120; border:1px solid #1e293b; border-radius:16px; padding:28px;">
        <div style="display:inline-block; font-size:11px; font-weight:700; letter-spacing:0.08em; text-transform:uppercase; color:#8aa5d6; background:rgba(77, 111, 169,0.1); border:1px solid rgba(52,211,153,0.25); padding:5px 10px; border-radius:999px;">
          NumoraLookup · Pass Confirmed
        </div>

        <h1 style="margin:14px 0 10px; font-size:22px; line-height:1.3; color:#ffffff;">
          Your Private Access Token is Ready
        </h1>

        <p style="margin:0 0 20px; font-size:14px; line-height:1.6; color:#94a3b8;">
          Thanks for purchasing <strong style="color:#ffffff;">${params.planLabel}</strong>. Your account has <strong style="color:#ffffff;">${params.creditsGranted} lookup credits</strong> ready to use across any browser or device.
        </p>

        <div style="background:#050811; border:1px solid #334155; border-radius:12px; padding:18px; text-align:center; margin-bottom:22px;">
          <div style="font-size:11px; font-weight:600; text-transform:uppercase; letter-spacing:0.1em; color:#64748b; margin-bottom:8px;">
            Private Access Token
          </div>
          <div style="font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-size:24px; font-weight:800; letter-spacing:0.12em; color:#8aa5d6;">
            ${params.accessToken}
          </div>
        </div>

        <div style="background:#080d1a; border:1px solid #1e293b; border-radius:12px; padding:16px; margin-bottom:22px;">
          <div style="font-size:12px; font-weight:700; color:#e2e8f0; margin-bottom:8px;">
            How to use on another phone or computer:
          </div>
          <ol style="margin:0; padding-left:18px; font-size:13px; line-height:1.65; color:#94a3b8;">
            <li>Open <strong style="color:#e2e8f0;">numoralookup.com/dashboard</strong></li>
            <li>Paste <strong style="color:#8aa5d6;">${params.accessToken}</strong> into the restore token box</li>
            <li>Search numbers or open your unlocked dossiers</li>
          </ol>
        </div>

        <a href="https://numoralookup.com/dashboard" style="display:block; text-align:center; background:#4d6fa9; color:#141519; font-weight:700; font-size:14px; text-decoration:none; padding:13px 18px; border-radius:10px;">
          Open Dashboard
        </a>

        <p style="margin:22px 0 0; padding-top:16px; border-top:1px solid #1e293b; font-size:12px; line-height:1.6; color:#64748b;">
          Transaction ID: <span style="color:#94a3b8;">${params.transactionId}</span><br/>
          Valid for 30 days (automatically extends each time you use a credit).<br/>
          Need help? Contact <a href="mailto:support@numoralookup.com" style="color:#94a3b8;">support@numoralookup.com</a>.
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
      text,
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
