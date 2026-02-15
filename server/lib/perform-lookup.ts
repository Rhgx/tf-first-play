import type { LookupResponse } from "../../lib/types";
import { ApiError } from "./errors";
import { detectBadge, createUnknownBadge } from "./badge-detector";
import { mapUnlockedAchievements } from "./achievement-transform";
import { SteamClient } from "./steam";

let cachedClient: SteamClient | null = null;
let cachedApiKey: string | null = null;

function getSteamClient(apiKey: string): SteamClient {
  if (!cachedClient || cachedApiKey !== apiKey) {
    cachedClient = new SteamClient(apiKey);
    cachedApiKey = apiKey;
  }
  return cachedClient;
}

/**
 * Performs a Steam profile lookup by input (Steam64 ID, vanity URL, or profile URL).
 * Used by both the API route and the /user/[id] server-rendered page.
 * @throws ApiError on validation or Steam API errors
 */
export async function performLookup(input: string): Promise<LookupResponse> {
  const apiKey = process.env.STEAM_API_KEY;
  if (!apiKey) {
    throw new ApiError("STEAM_API_KEY is not configured on the API server", 500);
  }

  const trimmed = input.trim();
  if (!trimmed) {
    throw new ApiError("Input is required", 400);
  }

  const steam = getSteamClient(apiKey);
  const steamId = await steam.resolveSteamId(trimmed);

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

  return {
    query: {
      rawInput: trimmed,
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
}
