/**
 * POST /api/inquiry — delivers a Get Started submission to the studio inbox.
 *
 * Written against the Web Fetch API (Request → Response), so the same file runs
 * unchanged on Vercel Edge Functions, Netlify Edge Functions and Cloudflare
 * Workers. No npm dependency: mail goes out over Resend's HTTP API.
 *
 * The API key lives ONLY here, server-side. It is never shipped to the browser.
 *
 * ── Setup ────────────────────────────────────────────────────────────────────
 * 1. Create a free account at resend.com — sign up with invisos99@gmail.com
 *    (it must be THIS address; see the note in step 3).
 * 2. Copy the API key and set it as an environment variable on your host:
 *        RESEND_API_KEY = re_xxxxxxxxxxxx
 * 3. Optional, once you own a domain: verify it in Resend and set
 *        MAIL_FROM = "Invisos <hello@yourdomain.com>"
 *    Until then the default sender below is Resend's shared onboarding address,
 *    which can ONLY deliver to the address that owns the Resend account. That
 *    is why step 1 must use invisos99@gmail.com — it is the TO below.
 * 4. Deploy. The form posts here automatically; no front-end change needed.
 *
 * 5. Set FIREBASE_PROJECT_ID to your Firebase project id — the ID token sent by
 *    the browser is verified against it here (see verifyToken.ts). Without it
 *    every request is rejected with 401, by design.
 *
 * Requests must carry `Authorization: Bearer <firebase id token>`. The sender
 * identity is read from that token, never from the request body.
 */

import { verifyIdToken } from "./verifyToken";

export const config = { runtime: "edge" };

const TO = "invisos99@gmail.com";
const FROM = "Invisos <onboarding@resend.dev>";
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

  const key = (globalThis as { process?: { env?: Record<string, string> } })
    .process?.env?.RESEND_API_KEY;
  if (!key) {
    return json({ error: "Mail transport not configured", fallback: true }, 503);
  }
  const from =
    (globalThis as { process?: { env?: Record<string, string> } }).process?.env
      ?.MAIL_FROM || FROM;

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: [TO],
      // so hitting Reply in the inbox goes straight back to the client
      reply_to: email,
      subject: `Project inquiry — ${name}${body.build ? ` · ${clean(body.build)}` : ""}`,
      text,
      html,
    }),
  });

  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    return json({ error: "Upstream mail error", detail, fallback: true }, 502);
  }
  return json({ ok: true });
}
