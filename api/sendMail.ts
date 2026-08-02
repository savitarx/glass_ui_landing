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
let cachedPort = 0;

/**
 * Ports to try, in order.
 *
 * Hosts block outbound SMTP selectively rather than wholesale — 465 is the most
 * commonly blocked, 587 often survives, and 2525 (an unofficial submission port
 * most relays also listen on) is rarely touched. Trying one port and giving up
 * meant a hard failure on a network where another port would have worked.
 *
 * An explicit SMTP_PORT is honoured exactly and never second-guessed.
 */
function candidatePorts(): number[] {
  const explicit = Number(env("SMTP_PORT") || 0);
  if (explicit) return [explicit];
  return [465, 587, 2525];
}

function build(port: number): Transporter | null {
  const user = env("SMTP_USER");
  const pass = env("SMTP_PASS");
  if (!user || !pass) return null;
  return nodemailer.createTransport({
    host: env("SMTP_HOST") || "smtp.gmail.com",
    port,
    // 465 is implicit TLS; 587 and 2525 upgrade via STARTTLS
    secure: port === 465,
    auth: { user, pass },
    pool: true,
    maxConnections: 2,
    /* Deliberately short. A blocked port does not refuse the connection, it
       black-holes it — so a long timeout just means the visitor watches a
       spinner for half a minute before being told it failed. Failing fast
       leaves room to try the next port and still answer quickly. */
    connectionTimeout: 7_000,
    greetingTimeout: 5_000,
    socketTimeout: 15_000,
  });
}

/** True when the failure is "could not get a connection", not "was rejected". */
function isUnreachable(e: unknown): boolean {
  const err = e as { code?: string; message?: string };
  const code = String(err?.code ?? "");
  return (
    code === "ETIMEDOUT" ||
    code === "ESOCKET" ||
    code === "ECONNREFUSED" ||
    code === "ECONNRESET" ||
    /timeout|timed out/i.test(String(err?.message ?? ""))
  );
}

/**
 * A working transport, reused once found. Building one per request means a
 * fresh TCP + TLS + AUTH handshake every time, which is slow and trips
 * provider rate limits.
 */
async function transport(): Promise<Transporter | null> {
  if (cached) return cached;

  let lastErr: unknown = null;
  for (const port of candidatePorts()) {
    const tx = build(port);
    if (!tx) return null; // no credentials — nothing to try
    try {
      await tx.verify();
      cached = tx;
      cachedPort = port;
      if (port !== candidatePorts()[0]) {
        console.warn(`[mail] port ${candidatePorts()[0]} unreachable; using ${port}`);
      }
      return cached;
    } catch (e) {
      lastErr = e;
      tx.close();
      // only a network-level failure is worth trying another port for; bad
      // credentials will fail identically everywhere
      if (!isUnreachable(e)) throw e;
    }
  }
  throw lastErr ?? new Error("no SMTP port reachable");
}

/**
 * Live connection test: TCP + TLS + AUTH, without sending anything.
 *
 * "Credentials are present" and "we can actually reach the mail server" are
 * different questions, and only the second one explains a 502. Returns a coarse
 * category — never the error text, which can contain the account and host.
 */
export async function verifySmtp(): Promise<{
  status: string;
  hint: string;
  host: string;
  port: number;
}> {
  const host = env("SMTP_HOST") || "smtp.gmail.com";
  const tried = candidatePorts();
  if (!env("SMTP_USER") || !env("SMTP_PASS")) {
    return {
      status: "not-configured",
      hint: "SMTP_USER / SMTP_PASS are unset.",
      host,
      port: tried[0],
    };
  }
  try {
    // walks the candidate ports and caches whichever one connects
    await transport();
    return {
      status: "ok",
      hint: `Connected and authenticated on port ${cachedPort}.`,
      host,
      port: cachedPort,
    };
  } catch (e) {
    const err = e as { code?: string; responseCode?: number; message?: string };
    const code = String(err?.code ?? "");
    const msg = String(err?.message ?? "");

    if (isUnreachable(e)) {
      return {
        status: "unreachable",
        hint:
          `No connection to ${host} on ${tried.join(", ")}. This host blocks ` +
          `outbound SMTP. Use a relay that offers port 2525, or a plan without ` +
          `the block — the credentials are not the problem.`,
        host,
        port: tried[0],
      };
    }
    if (err?.responseCode === 535 || /invalid login|username and password/i.test(msg)) {
      return {
        status: "auth-failed",
        hint:
          "The server was reached but rejected the credentials. For Gmail this " +
          "must be an App Password, not the account password.",
        host,
        port: tried[0],
      };
    }
    if (code === "EDNS" || /getaddrinfo/i.test(msg)) {
      return { status: "dns-failed", hint: `Could not resolve ${host}.`, host, port: tried[0] };
    }
    return {
      status: "failed",
      hint: "Connection failed for an unrecognised reason.",
      host,
      port: tried[0],
    };
  }
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
  if (!env("SMTP_USER") || !env("SMTP_PASS")) {
    return {
      ok: false,
      status: 503,
      error: "Mail is not configured on the server.",
      detail: "SMTP_USER and SMTP_PASS are unset.",
    };
  }

  let tx: Transporter;
  try {
    tx = (await transport())!;
  } catch (e) {
    /* No port reachable. Say so precisely rather than "try again" — retrying a
       blocked network path never succeeds, and the visitor should be told to
       use the address instead. */
    if (isUnreachable(e)) {
      return {
        ok: false,
        status: 502,
        error: "We couldn't send that just now. Please email us directly.",
        detail: `no SMTP port reachable (${candidatePorts().join(", ")}) — host likely blocks outbound SMTP`,
      };
    }
    const err = e as { message?: string };
    return {
      ok: false,
      status: 502,
      error: "We couldn't send that just now. Please email us directly.",
      detail: err?.message ?? String(e),
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
