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

// esbuild bundles api/inquiry.ts here during `npm run build` (see build:api).
const { default: inquiry } = await import("./dist-server/inquiry.mjs");

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
      const body = await readBody(req);
      const webRes = await inquiry(toWebRequest(req, body, PORT));
      await sendWebResponse(res, webRes);
      return;
    }

    // simple liveness endpoint for Render's health check
    if (url.pathname === "/healthz") {
      res.writeHead(200, { "content-type": "text/plain" }).end("ok");
      return;
    }

    if (req.method === "GET" || req.method === "HEAD") {
      if (await serveStatic(req, res, url.pathname)) return;
      // SPA fallback — hash routing means every deep link is still index.html
      const html = await readFile(join(DIST, "index.html"));
      res.writeHead(200, {
        "content-type": "text/html; charset=utf-8",
        "cache-control": "no-cache",
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
