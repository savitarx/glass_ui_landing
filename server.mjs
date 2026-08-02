/**
 * Production server for Render (a Web Service, not a Static Site).
 *
 * WHY THIS EXISTS
 * api/inquiry.ts is written against the Web Fetch API (Request -> Response),
 * the shape Vercel and Netlify invoke automatically. Render does not. On a Render Static Site only dist/ is served, so POST /api/inquiry
 * hit the SPA fallback and the form always reported "couldn't send" — no key
 * or env var could have fixed it, because nothing was listening.
 *
 * This wraps the SAME handler in a plain Node server, so there is still one
 * copy of the mail logic. The server itself pulls in nothing beyond Node's own
 * modules — Request, Response and crypto.subtle are built in on Node 18+. The
 * only runtime dependency in the whole path is nodemailer, used for SMTP.
 */
import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { join, extname, normalize } from "node:path";
import { fileURLToPath } from "node:url";
// same Node <-> Web Fetch conversion the dev middleware uses, so the handler
// behaves identically in both
import { readBody, toWebRequest, sendWebResponse } from "./api/node-adapter.mjs";

const ROOT = fileURLToPath(new URL(".", import.meta.url));
const DIST = join(ROOT, "dist");
const PORT = process.env.PORT || 3000;
const STARTED_AT = new Date().toISOString();

/* esbuild bundles api/inquiry.ts here during `npm run build` (see build:api).
   Loaded defensively: a bare top-level await import would throw and kill the
   process if the bundle were missing, and a dead process on a host looks
   identical to "not deployed" — the exact ambiguity that makes this hard to
   diagnose. Instead we boot, serve the site, and report the fault. */
let inquiry = null;
let verifySmtp = null;
let apiLoadError = null;
try {
  ({ default: inquiry, verifySmtp } = await import("./dist-server/inquiry.mjs"));
} catch (err) {
  apiLoadError = String(err?.message ?? err);
  console.error(
    "[fatal] could not load dist-server/inquiry.mjs — did `npm run build` run?\n       ",
    apiLoadError
  );
}

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".avif": "image/avif",
  ".ico": "image/x-icon",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".mp4": "video/mp4",
  ".webm": "video/webm",
  ".txt": "text/plain; charset=utf-8",
};

/**
 * Headers every HTML document needs.
 *
 * COOP is the one that matters here. Firebase's signInWithPopup opens a Google
 * window and then polls `popup.closed` and calls `popup.close()` to know when
 * sign-in finished. Under `Cross-Origin-Opener-Policy: same-origin` the browser
 * severs the opener relationship, those two calls are blocked, and the console
 * fills with "Cross-Origin-Opener-Policy policy would block the window.closed
 * call" — the popup can complete but the app never learns about it.
 *
 * `same-origin-allow-popups` keeps the isolation for ordinary navigations while
 * still letting a popup this page opened talk back, which is exactly the case
 * OAuth needs. Set explicitly so it does not depend on a platform default.
 */
const HTML_HEADERS = {
  "cross-origin-opener-policy": "same-origin-allow-popups",
  "x-content-type-options": "nosniff",
  "referrer-policy": "strict-origin-when-cross-origin",
};

async function serveStatic(req, res, urlPath) {
  // normalize + strip leading separators so "../" can never escape dist/
  const rel = normalize(decodeURIComponent(urlPath)).replace(/^([/\\])+/, "");
  const file = join(DIST, rel);
  if (!file.startsWith(DIST)) {
    res.writeHead(403).end("Forbidden");
    return true;
  }
  try {
    const info = await stat(file);
    if (!info.isFile()) return false;
    const ext = extname(file).toLowerCase();
    // hashed assets are immutable; index.html must always be revalidated
    const cache = rel.startsWith("assets/")
      ? "public, max-age=31536000, immutable"
      : "no-cache";
    res.writeHead(200, {
      "content-type": MIME[ext] ?? "application/octet-stream",
      "content-length": info.size,
      "cache-control": cache,
      // the popup-opener relaxation only belongs on documents, not on assets
      ...(ext === ".html" ? HTML_HEADERS : {}),
    });
    res.end(await readFile(file));
    return true;
  } catch {
    return false;
  }
}

const server = createServer(async (req, res) => {
  try {
    const url = new URL(req.url, "http://localhost");

    if (url.pathname === "/api/inquiry") {
      if (req.method !== "POST") {
        res.writeHead(405, { allow: "POST" }).end();
        return;
      }
      if (!inquiry) {
        res.writeHead(503, { "content-type": "application/json" });
        res.end(
          JSON.stringify({ error: "Mail is not configured on the server." })
        );
        return;
      }
      const body = await readBody(req);
      const webRes = await inquiry(toWebRequest(req, body, PORT));
      await sendWebResponse(res, webRes);
      return;
    }

    /* Liveness + self-diagnosis. Booleans only — never the values.
       Open this in a browser to answer, in one shot, whether THIS server is
       the thing answering your domain and whether it has what it needs. */
    if (url.pathname === "/healthz") {
      /* ?smtp=1 additionally opens a real connection (TCP + TLS + AUTH, no
         message sent). "Credentials are set" and "the mail server is actually
         reachable from this host" are different questions, and only the second
         explains a 502. The result is a coarse category — never the raw error,
         which can carry the account and host. */
      let smtp;
      if (url.searchParams.get("smtp") && verifySmtp) {
        try {
          smtp = await verifySmtp();
        } catch (e) {
          smtp = { status: "probe-threw", hint: String(e?.message ?? e) };
        }
      }
      res.writeHead(200, { "content-type": "application/json" });
      res.end(
        JSON.stringify(
          {
            server: "invisos",
            ok: true,
            apiHandlerLoaded: !!inquiry,
            apiLoadError,
            smtpConfigured: !!(process.env.SMTP_USER && process.env.SMTP_PASS),
            firebaseProjectIdSet: !!process.env.FIREBASE_PROJECT_ID,
            node: process.version,
            startedAt: STARTED_AT,
            ...(smtp ? { smtp } : {}),
          },
          null,
          1
        )
      );
      return;
    }

    if (req.method === "GET" || req.method === "HEAD") {
      if (await serveStatic(req, res, url.pathname)) return;
      // SPA fallback — hash routing means every deep link is still index.html
      const html = await readFile(join(DIST, "index.html"));
      res.writeHead(200, {
        "content-type": "text/html; charset=utf-8",
        "cache-control": "no-cache",
        ...HTML_HEADERS,
      });
      res.end(html);
      return;
    }

    res.writeHead(404).end("Not found");
  } catch (err) {
    console.error("[server]", err);
    if (!res.headersSent) res.writeHead(500, { "content-type": "application/json" });
    res.end(JSON.stringify({ error: "Server error." }));
  }
});

server.listen(PORT, () => {
  console.log(`invisos listening on :${PORT}`);
  // Surfaces the exact misconfiguration that makes sending fail, in the logs.
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS)
    console.warn("[warn] SMTP_USER / SMTP_PASS not set — sending will fail with 503");
  if (!process.env.FIREBASE_PROJECT_ID)
    console.warn("[warn] FIREBASE_PROJECT_ID is not set — every send will 401");
});
