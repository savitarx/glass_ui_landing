/** Types for node-adapter.mjs — it stays plain JS so server.mjs can import it
    at runtime without a build step, but vite.config.ts is type-checked. */
import type { IncomingMessage, ServerResponse } from "node:http";

export function readBody(req: IncomingMessage, limit?: number): Promise<Buffer>;
export function toWebRequest(
  req: IncomingMessage,
  body: Buffer,
  port?: number | string
): Request;
export function sendWebResponse(
  res: ServerResponse,
  webRes: Response
): Promise<void>;
