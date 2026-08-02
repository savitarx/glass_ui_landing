/**
 * Mail delivery over plain SMTP — no third-party mail service in the path.
 *
 * This replaces Resend. Resend meant an external account, an API key, and a
 * shared `onboarding@resend.dev` sender that silently refuses to deliver
 * anywhere except the account owner's own address — a trap that looks exactly
 * like a working send. Talking SMTP straight from your own mailbox removes the
 * middleman entirely: the only parties are this server and your mail provider.
 *
 * Defaults target Gmail, since the studio inbox is a Gmail address. Any SMTP
 * provider works by overriding SMTP_HOST / SMTP_PORT.
 *
 * ── Setup (Gmail) ───────────────────────────────────────────────────────────
 * 1. Enable 2-Step Verification on the Google account.
 * 2. Create an App Password (Google Account → Security → App passwords).
 *    A normal account password will NOT work for SMTP.
 * 3. Set on the host:
 *        SMTP_USER = invisos99@gmail.com
 *        SMTP_PASS = <the 16-character app password>
 *
 * Never commit these. The server reads them at runtime; nothing reaches the
 * browser.
 */
import nodemailer, { type Transporter } from "nodemailer";

const env = (k: string): string =>
  (globalThis as { process?: { env?: Record<string, string> } }).process?.env?.[
    k
  ] ?? "";

let cached: Transporter | null = null;

/**
 * One reused connection pool. Building a transport per request means a fresh
 * TCP + TLS + AUTH handshake every time, which is slow and is what trips
 * provider rate limits.
 */
function transport(): Transporter | null {
  const user = env("SMTP_USER");
  const pass = env("SMTP_PASS");
  if (!user || !pass) return null;

  if (!cached) {
    const port = Number(env("SMTP_PORT") || 465);
    cached = nodemailer.createTransport({
      host: env("SMTP_HOST") || "smtp.gmail.com",
      port,
      // 465 is implicit TLS; 587 upgrades via STARTTLS
      secure: port === 465,
      auth: { user, pass },
      pool: true,
      maxConnections: 2,
      connectionTimeout: 12_000,
      greetingTimeout: 8_000,
      socketTimeout: 20_000,
    });
  }
  return cached;
}

export type MailResult =
  | { ok: true }
  | { ok: false; status: number; error: string; detail?: string };

export type MailInput = {
  to: string;
  replyTo: string;
  subject: string;
  text: string;
  html: string;
};

/**
 * Sends, retrying once on a transient failure.
 *
 * SMTP replies in the 4xx range mean "try again later" (greylisting, a brief
 * rate limit, a dropped socket); 5xx means the message itself was rejected and
 * retrying would just fail identically. Only the former is worth a second go.
 */
export async function sendMail(m: MailInput): Promise<MailResult> {
  const tx = transport();
  if (!tx) {
    return {
      ok: false,
      status: 503,
      error: "Mail is not configured on the server.",
      detail: "SMTP_USER and SMTP_PASS are unset.",
    };
  }

  const from = env("MAIL_FROM") || `Invisos <${env("SMTP_USER")}>`;

  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      await tx.sendMail({
        from,
        to: m.to,
        replyTo: m.replyTo, // hitting Reply goes straight back to the client
        subject: m.subject,
        text: m.text,
        html: m.html,
      });
      return { ok: true };
    } catch (e) {
      const err = e as { responseCode?: number; message?: string };
      const code = err?.responseCode ?? 0;
      const permanent = code >= 500 && code < 600;
      if (permanent || attempt === 1) {
        return {
          ok: false,
          status: 502,
          error: "We couldn't send that just now.",
          detail: err?.message ?? String(e),
        };
      }
      // transient — brief pause, then one more try
      await new Promise((r) => setTimeout(r, 600));
    }
  }
  return { ok: false, status: 502, error: "We couldn't send that just now." };
}
