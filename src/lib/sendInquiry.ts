/**
 * Delivering the Get Started form to the studio inbox.
 *
 * Primary path: POST to /api/inquiry, a serverless function that sends the mail
 * server-side (see api/inquiry.ts). The mail credentials live only on the
 * server — nothing secret is shipped to the browser.
 *
 * Fallback: if that endpoint is missing (e.g. running `vite dev` locally, or
 * deployed before RESEND_API_KEY was set) or it errors, we open the visitor's
 * mail client with everything pre-filled. The form is never a dead end.
 */

export const RECIPIENT = "invisos99@gmai.com";

const ENDPOINT = "/api/inquiry";

export type Inquiry = {
  name: string;
  email: string;
  company: string;
  build: string;
  description: string;
  budget: string;
  timeline: string;
  assets: string[];
  reference: string;
};

export type SendResult = { ok: true; via: "server" | "mail-client" };

const dash = "—".repeat(34);

/** Human-readable plain-text body — also used for the mailto fallback. */
export function formatInquiry(i: Partial<Inquiry> = {}): string {
  const row = (label: string, value?: string) =>
    `${label}: ${value && value.trim() ? value.trim() : "—"}`;

  return [
    "NEW PROJECT INQUIRY — Invisos",
    dash,
    "",
    "ABOUT",
    row("Name", i.name),
    row("Email", i.email),
    row("Company", i.company),
    "",
    "PROJECT",
    row("Wants us to build", i.build),
    row("Budget", i.budget),
    row("Timeline", i.timeline),
    row("Existing assets", i.assets?.length ? i.assets.join(", ") : ""),
    row("Reference site", i.reference),
    "",
    "DESCRIPTION",
    i.description?.trim() || "—",
    "",
    dash,
    `Sent from the Invisos Get Started page · ${new Date().toLocaleString()}`,
  ].join("\n");
}

/** A pre-filled mailto: URL. Used as the fallback and for the direct link. */
export function buildInquiryMail(i?: Partial<Inquiry>): string {
  const subject = i?.name
    ? `Project inquiry — ${i.name}${i.build ? ` · ${i.build}` : ""}`
    : "Project inquiry — Invisos";
  return (
    `mailto:${RECIPIENT}` +
    `?subject=${encodeURIComponent(subject)}` +
    `&body=${encodeURIComponent(formatInquiry(i))}`
  );
}

/**
 * Tries the server first. Resolves with how it was delivered so the UI can
 * tell the visitor whether to press send in their mail client.
 */
export async function sendInquiry(i: Inquiry): Promise<SendResult> {
  try {
    const res = await fetch(ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...i, _trap: "" }),
    });
    if (res.ok) return { ok: true, via: "server" };
  } catch {
    // network error / endpoint absent → fall through to the mail client
  }
  window.location.href = buildInquiryMail(i);
  return { ok: true, via: "mail-client" };
}
