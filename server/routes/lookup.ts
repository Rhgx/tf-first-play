import type { LookupResponse } from "../../src/lib/types";
import { ApiError, isApiError, jsonResponse } from "../lib/errors";
import { detectBadge, createUnknownBadge } from "../lib/badge-detector";
import { mapUnlockedAchievements } from "../lib/achievement-transform";
import { SteamClient } from "../lib/steam";
import { parseLookupRequest } from "../lib/validation";

export async function handleLookup(request: Request): Promise<Response> {
  try {
    const apiKey = Bun.env.STEAM_API_KEY || process.env.STEAM_API_KEY;
    if (!apiKey) {
      throw new ApiError("STEAM_API_KEY is not configured on the API server", 500);
    }

    const { input } = await parseLookupRequest(request);
    const steam = new SteamClient(apiKey);
    const steamId = await steam.resolveSteamId(input);

    const [profileResult, inventoryResult, achievementsResult] = await Promise.all([
      steam.getPlayerSummary(steamId),
      steam.getPlayerItems(steamId),
      steam.getPlayerAchievements(steamId),
    ]);

    const warnings: string[] = [];

    if (!profileResult.success && profileResult.error) {
      warnings.push(profileResult.error);
    }

    if (inventoryResult.isPrivate) {
      warnings.push("Inventory is private");
    } else if (!inventoryResult.success && inventoryResult.error) {
      warnings.push(inventoryResult.error);
    }

    if (achievementsResult.isPrivate) {
      warnings.push("Achievements are private");
    } else if (!achievementsResult.success && achievementsResult.error) {
      warnings.push(achievementsResult.error);
    }

    const badge = inventoryResult.success
      ? detectBadge(inventoryResult.data)
      : createUnknownBadge(
          inventoryResult.isPrivate
            ? "Inventory is private, badge data is unavailable."
            : inventoryResult.error ?? "Badge data unavailable.",
        );

    const achievements = achievementsResult.success
      ? await mapUnlockedAchievements(achievementsResult.data)
      : {
          unlockedCount: 0,
          earliestUnlockIso: null,
          items: [],
        };

    const response: LookupResponse = {
      query: {
        rawInput: input,
        steamId,
      },
      profile: profileResult.data,
      badge,
      achievements,
      privacy: {
        inventoryPrivate: inventoryResult.isPrivate,
        achievementsPrivate: achievementsResult.isPrivate,
      },
      warnings,
    };

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
