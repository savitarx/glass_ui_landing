/**
 * Node <-> Web Fetch adapters, shared by the production server (server.mjs) and
 * the Vite dev middleware (vite.config.ts).
 *
 * api/inquiry.ts is written as `Request -> Response`. Both environments hand us
 * Node's IncomingMessage/ServerResponse instead, so the conversion lives here
 * once rather than being written twice and drifting.
 */

/** Collect a request body without assuming it arrives in one chunk. */
export const readBody = (req, limit = 1_000_000) =>
  new Promise((resolve, reject) => {
    const chunks = [];
    let size = 0;
    req.on("data", (c) => {
      size += c.length;
      if (size > limit) {
        reject(new Error("payload too large"));
        req.destroy();
        return;
      }
      chunks.push(c);
    });
    req.on("end", () => resolve(Buffer.concat(chunks)));
    req.on("error", reject);
  });

export function toWebRequest(req, body, port) {
  const host = req.headers.host ?? `localhost:${port ?? 3000}`;
  const proto = req.headers["x-forwarded-proto"] ?? "http";
  const headers = new Headers();
  for (const [k, v] of Object.entries(req.headers)) {
    if (Array.isArray(v)) v.forEach((one) => headers.append(k, one));
    else if (v != null) headers.set(k, v);
  }
  return new Request(`${proto}://${host}${req.url}`, {
    method: req.method,
    headers,
    body: req.method === "GET" || req.method === "HEAD" ? undefined : body,
  });
}

export async function sendWebResponse(res, webRes) {
  const buf = Buffer.from(await webRes.arrayBuffer());
  const headers = {};
  webRes.headers.forEach((v, k) => (headers[k] = v));
  res.writeHead(webRes.status, headers);
  res.end(buf);
}
