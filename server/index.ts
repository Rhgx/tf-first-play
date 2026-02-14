import { handleLookup } from "./routes/lookup";
import { isApiError, jsonResponse } from "./lib/errors";
import { handleImageProxy } from "./lib/image-proxy";

const port = Number(Bun.env.API_PORT ?? process.env.API_PORT ?? 3001);

Bun.serve({
  port,
  async fetch(request) {
    const url = new URL(request.url);

    if (request.method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type",
        },
      });
    }

    if (request.method === "GET" && url.pathname === "/api/health") {
      return jsonResponse({ ok: true, timestamp: new Date().toISOString() });
    }

    if (request.method === "POST" && url.pathname === "/api/lookup") {
      return handleLookup(request);
    }

    if (request.method === "GET" && url.pathname === "/api/image-proxy") {
      try {
        return await handleImageProxy(request);
      } catch (error) {
        if (isApiError(error)) {
          return jsonResponse({ error: error.message, errors: error.details ?? [error.message] }, error.status);
        }

        const message = error instanceof Error ? error.message : "Image proxy failed";
        return jsonResponse({ error: message, errors: [message] }, 500);
      }
    }

    return jsonResponse({ error: "Not found" }, 404);
  },
});

console.log(`TF2 web API running on http://localhost:${port}`);
