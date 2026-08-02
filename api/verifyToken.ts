/**
 * Firebase ID token verification, dependency-free.
 *
 * This is what actually enforces "only signed-in users can send mail". Hiding
 * the form behind a login is cosmetic — anyone can POST to the endpoint
 * directly — so the token is verified here, on the server, before a mail is
 * ever dispatched.
 *
 * Firebase ID tokens are RS256 JWTs signed by Google. Google publishes the
 * matching public keys as a JWK set, which WebCrypto can import directly — so
 * no firebase-admin SDK and no npm dependency, and it runs on edge runtimes.
 */

const JWKS_URL =
  "https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com";

type Jwk = JsonWebKey & { kid?: string; alg?: string };

/** Cached keys — the endpoint is rate-limited and the keys rotate slowly. */
let cache: { keys: Jwk[]; until: number } | null = null;

async function getKeys(): Promise<Jwk[]> {
  if (cache && Date.now() < cache.until) return cache.keys;
  const res = await fetch(JWKS_URL);
  if (!res.ok) throw new Error("jwks fetch failed");

  // honour the endpoint's own cache lifetime when it gives one
  const cc = res.headers.get("cache-control") ?? "";
  const maxAge = Number(/max-age=(\d+)/.exec(cc)?.[1] ?? 3600);
  const data = (await res.json()) as { keys: Jwk[] };
  cache = { keys: data.keys ?? [], until: Date.now() + maxAge * 1000 };
  return cache.keys;
}

const b64urlToBytes = (s: string): Uint8Array => {
  const pad = s.length % 4 ? "=".repeat(4 - (s.length % 4)) : "";
  const bin = atob(s.replace(/-/g, "+").replace(/_/g, "/") + pad);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
};

const decodeJson = (part: string): Record<string, unknown> =>
  JSON.parse(new TextDecoder().decode(b64urlToBytes(part)));

export type VerifiedUser = {
  uid: string;
  email: string;
  emailVerified: boolean;
  name: string;
};

/**
 * Returns the verified claims, or null if the token is missing, malformed,
 * expired, signed by the wrong key, or issued for a different project.
 */
export async function verifyIdToken(
  token: string | null,
  projectId: string
): Promise<VerifiedUser | null> {
  if (!token || !projectId) return null;

  const parts = token.split(".");
  if (parts.length !== 3) return null;

  let header: Record<string, unknown>;
  let payload: Record<string, unknown>;
  try {
    header = decodeJson(parts[0]);
    payload = decodeJson(parts[1]);
  } catch {
    return null;
  }

  if (header.alg !== "RS256") return null;

  // --- claim checks (cheap, do them before any crypto) ---
  const now = Math.floor(Date.now() / 1000);
  const exp = Number(payload.exp ?? 0);
  const iat = Number(payload.iat ?? 0);
  const aud = String(payload.aud ?? "");
  const iss = String(payload.iss ?? "");
  const sub = String(payload.sub ?? "");

  if (exp <= now) return null; // expired
  if (iat > now + 300) return null; // issued in the future — reject
  if (aud !== projectId) return null; // token for a different Firebase project
  if (iss !== `https://securetoken.google.com/${projectId}`) return null;
  if (!sub) return null;

  // --- signature ---
  const keys = await getKeys();
  const jwk = keys.find((k) => k.kid === header.kid);
  if (!jwk) return null;

  let key: CryptoKey;
  try {
    key = await crypto.subtle.importKey(
      "jwk",
      { ...jwk, alg: "RS256", ext: true },
      { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
      false,
      ["verify"]
    );
  } catch {
    return null;
  }

  const ok = await crypto.subtle.verify(
    "RSASSA-PKCS1-v1_5",
    key,
    b64urlToBytes(parts[2]),
    new TextEncoder().encode(`${parts[0]}.${parts[1]}`)
  );
  if (!ok) return null;

  return {
    uid: sub,
    email: String(payload.email ?? ""),
    emailVerified: payload.email_verified === true,
    name: String(payload.name ?? ""),
  };
}
