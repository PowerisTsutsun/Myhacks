import { Resend } from "resend";

// Lazily initialized so missing API key doesn't crash the module at load time
let _resend: Resend | null = null;
function getResend(): Resend {
  if (!_resend) {
    const key = process.env.RESEND_API_KEY;
    if (!key) throw new Error("RESEND_API_KEY is not set");
    _resend = new Resend(key);
  }
  return _resend;
}

const FROM = process.env.RESEND_FROM_EMAIL ?? "LaserHacks <noreply@laserhack.org>";
const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://laserhack.org";

export interface SendResult {
  ok: boolean;
  error?: string;
}

async function send(opts: {
  to: string;
  subject: string;
  html: string;
  text: string;
  replyTo?: string;
}): Promise<SendResult> {
  try {
    const { error } = await getResend().emails.send({
      from: FROM,
      to: opts.to,
      subject: opts.subject,
      html: opts.html,
      text: opts.text,
      ...(opts.replyTo ? { replyTo: opts.replyTo } : {}),
    });
    if (error) {
      console.error("[email] send error:", error);
      return { ok: false, error: error.message };
    }
    return { ok: true };
  } catch (err) {
    console.error("[email] unexpected error:", err);
    return { ok: false, error: "Email send failed" };
  }
}

// ---------------------------------------------------------------------------
// Email: Verify your email address
// ---------------------------------------------------------------------------
export async function sendVerificationEmail(opts: {
  to: string;
  name: string;
  token: string;
}): Promise<SendResult> {
  const url = `${APP_URL}/verify-email?token=${opts.token}`;
  return send({
    to: opts.to,
    subject: "Verify your LaserHacks email",
    html: verificationTemplate({ name: opts.name, url }),
    text: `Hi ${opts.name},\n\nVerify your LaserHacks email by visiting:\n${url}\n\nThis link expires in 24 hours.\n\n— LaserHacks Team`,
  });
}

// ---------------------------------------------------------------------------
// Email: 2FA login code
// ---------------------------------------------------------------------------
export async function send2FACode(opts: {
  to: string;
  name: string;
  code: string;
}): Promise<SendResult> {
  return send({
    to: opts.to,
    subject: `${opts.code} — Your LaserHacks login code`,
    html: twoFactorTemplate({ name: opts.name, code: opts.code }),
    text: `Hi ${opts.name},\n\nYour LaserHacks verification code is: ${opts.code}\n\nThis code expires in 10 minutes. Do not share it with anyone.\n\n— LaserHacks Team`,
  });
}

// ---------------------------------------------------------------------------
// Email: Registration confirmation
// ---------------------------------------------------------------------------
export async function sendRegistrationConfirmation(opts: {
  to: string;
  firstName: string;
  eventName?: string;
}): Promise<SendResult> {
  const eventName = opts.eventName ?? "LaserHacks 2026";
  return send({
    to: opts.to,
    subject: `You're registered for ${eventName}! 🎉`,
    html: registrationConfirmTemplate({ firstName: opts.firstName, eventName }),
    text: `Hi ${opts.firstName},\n\nYou're registered for ${eventName}! We're thrilled to have you.\n\nWe'll be in touch with event details, team matching info, and day-of logistics. Keep an eye on your inbox!\n\n— The LaserHacks Team`,
  });
}

// ---------------------------------------------------------------------------
// Email: Password reset
// ---------------------------------------------------------------------------
export async function sendPasswordResetEmail(opts: {
  to: string;
  name: string;
  token: string;
}): Promise<SendResult> {
  const url = `${APP_URL}/reset-password?token=${opts.token}`;
  return send({
    to: opts.to,
    subject: "Reset your LaserHacks password",
    html: passwordResetTemplate({ name: opts.name, url }),
    text: `Hi ${opts.name},\n\nReset your LaserHacks password by visiting:\n${url}\n\nThis link expires in 1 hour. If you didn't request this, ignore this email.\n\n— LaserHacks Team`,
  });
}

// ---------------------------------------------------------------------------
// Email: Contact form notification (sent to team inbox)
// ---------------------------------------------------------------------------
const CONTACT_TO = process.env.CONTACT_EMAIL ?? "contact@laserhack.org";

export async function sendContactNotificationEmail(opts: {
  fromName: string;
  fromEmail: string;
  subject: string;
  message: string;
}): Promise<SendResult> {
  return send({
    to: CONTACT_TO,
    subject: `Contact: ${opts.subject}`,
    replyTo: `${opts.fromName} <${opts.fromEmail}>`,
    html: contactNotificationTemplate(opts),
    text: `New contact form submission from ${opts.fromName} <${opts.fromEmail}>\n\nSubject: ${opts.subject}\n\n${opts.message}`,
  });
}

// ---------------------------------------------------------------------------
// Email: Custom notification (admin broadcast)
// ---------------------------------------------------------------------------
export async function sendCustomNotificationEmail(opts: {
  to: string;
  name: string;
  subject: string;
  body: string;
}): Promise<SendResult> {
  return send({
    to: opts.to,
    subject: opts.subject,
    html: customNotificationTemplate({ name: opts.name, body: opts.body }),
    text: `Hi ${opts.name},\n\n${opts.body}\n\n— LaserHacks Team`,
  });
}

// ---------------------------------------------------------------------------
// HTML templates
// ---------------------------------------------------------------------------

const BASE_STYLE = `
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  max-width: 560px;
  margin: 0 auto;
  background: #ffffff;
  color: #1a2744;
`;

const HEADER_STYLE = `
  background: #1558a0;
  padding: 28px 32px;
  border-radius: 12px 12px 0 0;
  text-align: center;
`;

const BODY_STYLE = `
  padding: 32px;
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-top: none;
`;

const FOOTER_STYLE = `
  padding: 20px 32px;
  background: #f8faff;
  border: 1px solid #e2e8f0;
  border-top: none;
  border-radius: 0 0 12px 12px;
  text-align: center;
  font-size: 12px;
  color: #94a3b8;
`;

const BTN_STYLE = `
  display: inline-block;
  background: #1558a0;
  color: #ffffff !important;
  text-decoration: none;
  padding: 14px 28px;
  border-radius: 8px;
  font-weight: 600;
  font-size: 15px;
  margin: 20px 0;
`;

function wrap(content: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>LaserHacks</title></head>
<body style="margin:0;padding:16px;background:#f1f5f9;">
<div style="${BASE_STYLE}">
  <div style="${HEADER_STYLE}">
    <p style="margin:0;font-size:22px;font-weight:800;color:#ffffff;letter-spacing:-0.5px;">Laser<span style="color:#90c0f7;">Hacks</span></p>
    <p style="margin:4px 0 0;font-size:12px;color:rgba(255,255,255,0.7);letter-spacing:2px;text-transform:uppercase;">IVC Hackathon</p>
  </div>
  <div style="${BODY_STYLE}">${content}</div>
  <div style="${FOOTER_STYLE}">
    <p style="margin:0;">© 2026 LaserHacks — Irvine Valley College</p>
    <p style="margin:4px 0 0;">Questions? Email <a href="mailto:info@laserhack.org" style="color:#1558a0;">info@laserhack.org</a></p>
  </div>
</div>
</body></html>`;
}

function verificationTemplate({ name, url }: { name: string; url: string }): string {
  return wrap(`
    <h1 style="margin:0 0 8px;font-size:22px;font-weight:700;color:#0d1b2a;">Verify your email</h1>
    <p style="margin:0 0 16px;color:#475569;line-height:1.6;">Hi ${name},</p>
    <p style="margin:0 0 16px;color:#475569;line-height:1.6;">
      Thanks for creating a LaserHacks account! Click the button below to verify your email address and activate your account.
    </p>
    <div style="text-align:center;">
      <a href="${url}" style="${BTN_STYLE}">Verify Email Address</a>
    </div>
    <p style="margin:16px 0 0;font-size:13px;color:#94a3b8;">
      This link expires in <strong>24 hours</strong>. If you didn't create an account, you can safely ignore this email.
    </p>
    <p style="margin:12px 0 0;font-size:12px;color:#cbd5e1;word-break:break-all;">
      Or copy this link: ${url}
    </p>
  `);
}

function twoFactorTemplate({ name, code }: { name: string; code: string }): string {
  return wrap(`
    <h1 style="margin:0 0 8px;font-size:22px;font-weight:700;color:#0d1b2a;">Your login code</h1>
    <p style="margin:0 0 16px;color:#475569;line-height:1.6;">Hi ${name},</p>
    <p style="margin:0 0 16px;color:#475569;line-height:1.6;">
      Use this verification code to complete your LaserHacks login:
    </p>
    <div style="text-align:center;margin:24px 0;">
      <div style="display:inline-block;background:#eff6ff;border:2px solid #bfdbfe;border-radius:12px;padding:20px 40px;">
        <p style="margin:0;font-size:40px;font-weight:800;letter-spacing:8px;color:#1558a0;font-family:monospace;">${code}</p>
      </div>
    </div>
    <p style="margin:0 0 8px;font-size:13px;color:#94a3b8;">
      This code expires in <strong>10 minutes</strong> and can only be used once.
    </p>
    <p style="margin:0;font-size:13px;color:#94a3b8;">
      If you didn't try to log in, someone may have your password — consider changing it immediately.
    </p>
  `);
}

function registrationConfirmTemplate({ firstName, eventName }: { firstName: string; eventName: string }): string {
  return wrap(`
    <h1 style="margin:0 0 8px;font-size:22px;font-weight:700;color:#0d1b2a;">You're in, ${firstName}! 🎉</h1>
    <p style="margin:0 0 16px;color:#475569;line-height:1.6;">
      Your registration for <strong>${eventName}</strong> has been received. We're so excited to have you join us!
    </p>
    <div style="background:#eff6ff;border-left:4px solid #1558a0;border-radius:0 8px 8px 0;padding:16px 20px;margin:20px 0;">
      <p style="margin:0 0 8px;font-weight:600;color:#1558a0;">What happens next?</p>
      <ul style="margin:0;padding-left:18px;color:#475569;line-height:1.8;">
        <li>Watch your inbox for event updates and logistics</li>
        <li>We'll send team matching details closer to the event</li>
        <li>Accepted participants will receive a confirmation email</li>
      </ul>
    </div>
    <p style="margin:16px 0 0;color:#475569;line-height:1.6;">
      LaserHacks is beginner-friendly — no matter your experience level, you belong here.
      If you have any questions, just reply to this email or reach out at
      <a href="mailto:info@laserhack.org" style="color:#1558a0;">info@laserhack.org</a>.
    </p>
    <p style="margin:20px 0 0;color:#475569;">See you at the hackathon! 🚀</p>
  `);
}

function passwordResetTemplate({ name, url }: { name: string; url: string }): string {
  return wrap(`
    <h1 style="margin:0 0 8px;font-size:22px;font-weight:700;color:#0d1b2a;">Reset your password</h1>
    <p style="margin:0 0 16px;color:#475569;line-height:1.6;">Hi ${name},</p>
    <p style="margin:0 0 16px;color:#475569;line-height:1.6;">
      We received a request to reset your LaserHacks password. Click the button below to choose a new one.
    </p>
    <div style="text-align:center;">
      <a href="${url}" style="${BTN_STYLE}">Reset Password</a>
    </div>
    <p style="margin:16px 0 0;font-size:13px;color:#94a3b8;">
      This link expires in <strong>1 hour</strong>. If you didn't request a password reset, you can safely ignore this email — your account is unchanged.
    </p>
    <p style="margin:12px 0 0;font-size:12px;color:#cbd5e1;word-break:break-all;">
      Or copy this link: ${url}
    </p>
  `);
}

function customNotificationTemplate({ name, body }: { name: string; body: string }): string {
  const escaped = body
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\n/g, "<br>");
  return wrap(`
    <p style="margin:0 0 16px;color:#475569;line-height:1.6;">Hi ${name},</p>
    <div style="color:#475569;line-height:1.7;">${escaped}</div>
    <p style="margin:24px 0 0;color:#475569;">— The LaserHacks Team</p>
  `);
}

function contactNotificationTemplate(opts: {
  fromName: string;
  fromEmail: string;
  subject: string;
  message: string;
}): string {
  const escaped = opts.message
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\n/g, "<br>");
  return wrap(`
    <h1 style="margin:0 0 16px;font-size:20px;font-weight:700;color:#0d1b2a;">New Contact Form Submission</h1>
    <div style="background:#f8faff;border:1px solid #e2e8f0;border-radius:8px;padding:16px 20px;margin-bottom:20px;">
      <p style="margin:0 0 6px;font-size:13px;color:#475569;"><strong>From:</strong> ${opts.fromName} &lt;${opts.fromEmail}&gt;</p>
      <p style="margin:0;font-size:13px;color:#475569;"><strong>Subject:</strong> ${opts.subject}</p>
    </div>
    <p style="margin:0 0 8px;font-size:13px;font-weight:600;color:#1a2744;">Message:</p>
    <div style="color:#475569;line-height:1.7;font-size:14px;">${escaped}</div>
    <p style="margin:20px 0 0;font-size:12px;color:#94a3b8;">Reply directly to this email to respond to ${opts.fromName}.</p>
  `);
}
