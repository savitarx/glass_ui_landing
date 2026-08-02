/**
 * Delivering the Get Started form to the studio inbox.
 *
 * Primary path: POST to /api/inquiry, a serverless function that sends the mail
 * server-side (see api/inquiry.ts). The mail credentials live only on the
 * server — nothing secret is shipped to the browser.
 *
 * There is no mail-client fallback: handing the visitor off to their mail app
 * mid-flow was the thing we were asked to remove. If delivery fails the form
 * stays put, keeps everything typed, and reports why.
 *
 * The request carries the signed-in user's Firebase ID token; api/inquiry.ts
 * refuses anything it can't verify.
 */
export const RECIPIENT = "invisos99@gmail.com";

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

export type SendResult =
  | { ok: true }
  /** delivery failed — the form stays put and shows why */
  | { ok: false; message: string };

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
 * Sends the inquiry from THIS page. The visitor is never handed off to a mail
 * app — the previous mailto fallback did exactly that, which yanked them out of
 * the site mid-flow. If delivery fails we stay put and report it, so the person
 * can retry or copy the address, and nothing they typed is lost.
 */
export async function sendInquiry(
  i: Inquiry,
  /** Firebase ID token — the server verifies it before sending anything. */
  idToken?: string
): Promise<SendResult> {
  if (!idToken) {
    return {
      ok: false,
      message: "Your session expired. Please sign in again to send this.",
    };
  }
  try {
    const res = await fetch(ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${idToken}`,
      },
      body: JSON.stringify({ ...i, _trap: "" }),
    });

    if (res.status === 401) {
      return {
        ok: false,
        message: "Your session expired. Please sign in again to send this.",
      };
    }

    /* Read the body ONCE — it is a stream and cannot be consumed twice. */
    const contentType = res.headers.get("content-type") ?? "";
    const isJson = contentType.includes("application/json");
    let data: { ok?: boolean; error?: string } | null = null;
    if (isJson) {
      try {
        data = (await res.json()) as { ok?: boolean; error?: string };
      } catch {
        data = null;
      }
    }

    /* Success requires the API's OWN json acknowledgement — not merely a 2xx.
       `if (res.ok)` alone was a real trap: a static host with an SPA rewrite
       answers POST /api/inquiry with 200 and index.html, so the form reported
       "sent" while no mail was ever dispatched. Anything that is not
       {"ok":true} in a JSON body means we did not reach the handler. */
    if (res.ok) {
      if (data?.ok === true) return { ok: true };
      return {
        ok: false,
        message:
          `The contact service isn't running at this address, so nothing was sent. ` +
          `Please email us directly at ${RECIPIENT}.`,
      };
    }

    // the endpoint answered but refused — surface its reason when it gave one
    const message = data?.error ?? "";
    if (res.status === 422) {
      return { ok: false, message: message || "Please check your name and email." };
    }

    /* A 404 (or an HTML body) means the endpoint itself is missing — the app is
       being served without its server, so no amount of retrying will help. That
       is a deployment fault, and saying "try again" sends people in circles. */
    if (res.status === 404 || !message) {
      return {
        ok: false,
        message:
          res.status === 404
            ? `The contact service isn't reachable right now. Please email us directly at ${RECIPIENT}.`
            : "We couldn't send that just now. Please try again, or email us directly.",
      };
    }

    /* Otherwise pass the server's own wording through. These strings are
       written to be shown ("Mail is not configured on the server.") and are
       deliberately free of SMTP detail, which stays in the server log. Hiding
       them behind one generic sentence made every distinct failure look the
       same and impossible to diagnose. */
    return { ok: false, message };
  } catch {
    return {
      ok: false,
      message:
        "Network error — please check your connection and try again, or email us directly.",
    };
  }
}
