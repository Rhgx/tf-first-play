import { handleImageProxy } from "@/server/lib/image-proxy";
import { isApiError, jsonResponse } from "@/server/lib/errors";

export async function GET(request: Request): Promise<Response> {
  try {
    return await handleImageProxy(request);
  } catch (error) {
    if (isApiError(error)) {
      return jsonResponse(
        { error: error.message, errors: error.details ?? [error.message] },
        error.status,
      );
    }

    const message = error instanceof Error ? error.message : "Image proxy failed";
    return jsonResponse({ error: message, errors: [message] }, 500);
  }
}
