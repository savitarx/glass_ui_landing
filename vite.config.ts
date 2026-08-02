import { defineConfig, loadEnv, type Plugin } from "vite";
import react from "@vitejs/plugin-react";
import {
  readBody,
  toWebRequest,
  sendWebResponse,
} from "./api/node-adapter.mjs";

/**
 * Runs the real /api/inquiry handler during `npm run dev`.
 *
 * Without this, Vite serves only the client, so POST /api/inquiry had nothing
 * behind it and the form failed locally no matter how the mail was configured
 * — indistinguishable from a genuine send failure. Now dev and production go
 * through the same code path.
 */
function apiDev(mode: string): Plugin {
  return {
    name: "invisos-api-dev",
    apply: "serve",
    configureServer(server) {
      /* Vite only exposes VITE_* to the client, by design. The handler needs
         the SERVER vars (SMTP_USER/PASS, FIREBASE_PROJECT_ID) from .env, so
         load them with an empty prefix and put them on process.env — where the
         handler already looks. Anything already in process.env wins, so a real
         shell variable is never clobbered by the file. */
      const env = loadEnv(mode, process.cwd(), "");
      for (const [k, v] of Object.entries(env)) {
        if (!(k in process.env)) process.env[k] = v;
      }

      server.middlewares.use("/api/inquiry", async (req, res) => {
        try {
          if (req.method !== "POST") {
            res.writeHead(405, { allow: "POST" }).end();
            return;
          }
          // ssrLoadModule transpiles the TS handler on the fly and picks up
          // edits without a restart
          const mod = await server.ssrLoadModule("/api/inquiry.ts");
          const body = await readBody(req);
          const webRes = await mod.default(toWebRequest(req, body, 5175));
          await sendWebResponse(res, webRes);
        } catch (err) {
          server.config.logger.error(`[api/inquiry] ${String(err)}`);
          res.writeHead(500, { "content-type": "application/json" });
          res.end(JSON.stringify({ error: "Server error." }));
        }
      });
    },
  };
}

export default defineConfig(({ mode }) => ({
  plugins: [react(), apiDev(mode)],
  server: { host: true, port: 5175, allowedHosts: true },
}));
