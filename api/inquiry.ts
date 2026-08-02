/**
 * POST /api/inquiry — delivers a Get Started submission to the studio inbox.
 *
 * Mail goes out over plain SMTP from the studio's own mailbox (see sendMail.ts).
 * There is no third-party mail service, no API key to expire, and no shared
 * sender address with hidden delivery restrictions.
 *
 * ── Setup ────────────────────────────────────────────────────────────────────
 * 1. On the Google account for invisos99@gmail.com, turn on 2-Step Verification,
 *    then create an App Password (Security -> App passwords). A normal account
 *    password will not authenticate against SMTP.
 * 2. Set these on the host (Render -> Environment). They are read at runtime and
 *    never reach the browser:
 *        SMTP_USER = invisos99@gmail.com
 *        SMTP_PASS = <16-character app password>
 * 3. Set FIREBASE_PROJECT_ID to your Firebase project id — the ID token sent by
 *    the browser is verified against it (see verifyToken.ts). Without it every
 *    request is rejected with 401, by design.
 *
 * Optional overrides: SMTP_HOST / SMTP_PORT for a non-Gmail provider, MAIL_FROM
 * for a custom display sender.
 *
 * Requests must carry `Authorization: Bearer <firebase id token>`. The sender
 * identity is read from that token, never from the request body.
 *
 * NOTE: this is no longer an edge function. SMTP needs raw TCP sockets, so it
 * runs on Node (see server.mjs), which is what Render executes anyway.
 */

import { verifyIdToken } from "./verifyToken";
import { sendMail } from "./sendMail";

const TO = "invisos99@gmail.com";
const MAX = 8000; // hard cap on any single field, cheap abuse guard

type Payload = {
  name?: string;
  email?: string;
  company?: string;
  build?: string;
  description?: string;
  budget?: string;
  timeline?: string;
  assets?: string[];
  reference?: string;
  /** hidden field — real users never fill this in */
  _trap?: string;
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });

const clean = (v: unknown): string =>
  typeof v === "string" ? v.trim().slice(0, MAX) : "";

const escapeHtml = (s: string) =>
  s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

export default async function handler(request: Request): Promise<Response> {
  if (request.method !== "POST") {
    return json({ error: "Method not allowed" }, 405);
  }

  let body: Payload;
  try {
    body = (await request.json()) as Payload;
  } catch {
    return json({ error: "Invalid JSON" }, 400);
  }

  // silently accept-and-drop obvious bots so they don't retry
  if (clean(body._trap)) return json({ ok: true });

  /* AUTH GATE — the real one.
     Gating the form behind a login screen only hides the UI; anyone can POST
     here directly. So the Firebase ID token is verified server-side and the
     sender identity is taken FROM THE TOKEN, not from the request body: a
     caller cannot claim to be someone else. */
  const env = (globalThis as { process?: { env?: Record<string, string> } })
    .process?.env;
  const projectId = env?.FIREBASE_PROJECT_ID ?? "";
  const authHeader = request.headers.get("authorization") ?? "";
  const bearer = authHeader.toLowerCase().startsWith("bearer ")
    ? authHeader.slice(7).trim()
    : null;

  /* A missing FIREBASE_PROJECT_ID makes verifyIdToken return null immediately,
     which is indistinguishable from a bad token — so a server that was simply
     never configured told every visitor to sign in again, forever. Separate
     the two: this one is a deployment fault, not the visitor's. */
  if (!projectId) {
    return json(
      { error: "Sign-in verification isn't configured on the server." },
      503
    );
  }

  const verified = await verifyIdToken(bearer, projectId);
  if (!verified) {
    return json({ error: "Please sign in to send an enquiry." }, 401);
  }
  if (!verified.email) {
    return json({ error: "Your account has no email address." }, 403);
  }

  // identity comes from the verified token; the body only supplies the brief
  const name = clean(body.name) || verified.name || verified.email;
  const email = verified.email;

  const fields: [string, string][] = [
    ["Name", name],
    ["Email", email],
    ["Company", clean(body.company)],
    ["Wants us to build", clean(body.build)],
    ["Budget", clean(body.budget)],
    ["Timeline", clean(body.timeline)],
    [
      "Existing assets",
      Array.isArray(body.assets) ? body.assets.map(clean).join(", ") : "",
    ],
    ["Reference site", clean(body.reference)],
  ];
  const description = clean(body.description);

  const text = [
    "NEW PROJECT INQUIRY — Invisos",
    "".padEnd(34, "-"),
    "",
    ...fields.map(([k, v]) => `${k}: ${v || "—"}`),
    "",
    "DESCRIPTION",
    description || "—",
    "",
    "".padEnd(34, "-"),
    `Received ${new Date().toUTCString()}`,
  ].join("\n");

  const html = `
    <div style="font-family:-apple-system,Segoe UI,Roboto,sans-serif;max-width:640px;color:#14141a">
      <h2 style="margin:0 0 4px;font-size:18px">New project inquiry</h2>
      <p style="margin:0 0 20px;color:#5f5f6b;font-size:13px">via the Invisos Get Started page</p>
      <table style="width:100%;border-collapse:collapse;font-size:14px">
        ${fields
          .map(
            ([k, v]) => `<tr>
              <td style="padding:8px 12px 8px 0;color:#6b6b78;white-space:nowrap;vertical-align:top">${k}</td>
              <td style="padding:8px 0;border-bottom:1px solid #ecebf0">${escapeHtml(v) || "—"}</td>
            </tr>`
          )
          .join("")}
      </table>
      <h3 style="margin:24px 0 8px;font-size:14px;color:#6b6b78">Description</h3>
      <p style="margin:0;font-size:14px;line-height:1.6;white-space:pre-wrap">${
        escapeHtml(description) || "—"
      }</p>
    </div>`;

  const sent = await sendMail({
    to: TO,
    replyTo: email,
    subject: `Project inquiry — ${name}${body.build ? ` · ${clean(body.build)}` : ""}`,
    text,
    html,
  });

  if (!sent.ok) {
    // The reason is logged for the operator but never returned to the browser —
    // an SMTP error string can leak the account and the host.
    console.error("[inquiry] mail failed:", sent.detail ?? sent.error);
    return json({ error: sent.error }, sent.status);
  }
  return json({ ok: true });
}
