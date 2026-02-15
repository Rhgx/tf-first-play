import { isApiError, jsonResponse } from "../lib/errors";
import { createUnknownBadge } from "../lib/badge-detector";
import { performLookup } from "../lib/perform-lookup";
import { parseLookupRequest } from "../lib/validation";

export async function handleLookup(request: Request): Promise<Response> {
  try {
    const { input } = await parseLookupRequest(request);
    const response = await performLookup(input);
    return jsonResponse(response, 200);
  } catch (error) {
    if (isApiError(error)) {
      return jsonResponse(
        {
          query: { rawInput: "" },
          profile: null,
          badge: createUnknownBadge("No badge data available."),
          achievements: { unlockedCount: 0, earliestUnlockIso: null, items: [] },
          privacy: { inventoryPrivate: false, achievementsPrivate: false },
          warnings: [],
          errors: error.details && error.details.length > 0 ? error.details : [error.message],
        },
        error.status,
      );
    }

    const message = error instanceof Error ? error.message : "Unexpected server error";
    return jsonResponse(
      {
        query: { rawInput: "" },
        profile: null,
        badge: createUnknownBadge("No badge data available."),
        achievements: { unlockedCount: 0, earliestUnlockIso: null, items: [] },
        privacy: { inventoryPrivate: false, achievementsPrivate: false },
        warnings: [],
        errors: [message],
      },
      500,
    );
  }
}
