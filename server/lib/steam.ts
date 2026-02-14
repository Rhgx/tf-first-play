import type { BadgeTier } from "../../src/lib/types";

export interface ItemAttribute {
  defindex: number;
  value?: number | string;
  float_value?: number;
}

export interface SteamItem {
  id: number;
  defindex: number;
  attributes?: ItemAttribute[];
}

export interface SteamAchievement {
  apiname: string;
  achieved: number;
  unlocktime: number;
  name?: string;
  description?: string;
}

interface VanityUrlResponse {
  response: {
    success: number;
    steamid?: string;
    message?: string;
  };
}

interface PlayerSummariesResponse {
  response: {
    players: Array<{
      steamid: string;
      personaname: string;
      profileurl: string;
      avatarfull: string;
    }>;
  };
}

interface InventoryResponse {
  result: {
    status: number;
    items?: SteamItem[];
  };
}

interface AchievementsResponse {
  playerstats: {
    success: boolean;
    achievements?: SteamAchievement[];
    error?: string;
  };
}

interface SteamRequestResult<T> {
  success: boolean;
  data: T;
  isPrivate: boolean;
  error?: string;
}

const STEAM_API_BASE = "https://api.steampowered.com";
const TF2_APP_ID = 440;

export class SteamClient {
  constructor(private readonly apiKey: string) {
    if (!apiKey) {
      throw new Error("STEAM_API_KEY is required");
    }
  }

  async resolveSteamId(input: string): Promise<string> {
    const trimmed = input.trim();

    if (/^\d{17}$/.test(trimmed)) {
      return trimmed;
    }

    const profileMatch = trimmed.match(/steamcommunity\.com\/profiles\/(\d{17})/i);
    if (profileMatch?.[1]) {
      return profileMatch[1];
    }

    const vanityMatch = trimmed.match(/steamcommunity\.com\/id\/([^/\s]+)/i);
    const vanityName = vanityMatch?.[1] ?? trimmed;

    const response = await fetch(
      `${STEAM_API_BASE}/ISteamUser/ResolveVanityURL/v1/?key=${this.apiKey}&vanityurl=${encodeURIComponent(vanityName)}`,
    );

    if (!response.ok) {
      throw new Error(`Steam API error (${response.status}) while resolving Steam ID`);
    }

    const payload = (await response.json()) as VanityUrlResponse;

    if (payload.response.success === 1 && payload.response.steamid) {
      return payload.response.steamid;
    }

    if (payload.response.success === 42) {
      throw new Error(`No Steam account found for "${vanityName}"`);
    }

    throw new Error(payload.response.message ?? "Failed to resolve Steam ID");
  }

  async getPlayerSummary(steamId: string): Promise<SteamRequestResult<{ steamId: string; personaName: string; profileUrl: string; avatarFull: string } | null>> {
    const response = await fetch(
      `${STEAM_API_BASE}/ISteamUser/GetPlayerSummaries/v2/?key=${this.apiKey}&steamids=${steamId}`,
    );

    if (!response.ok) {
      return {
        success: false,
        data: null,
        isPrivate: false,
        error: `Steam API error (${response.status}) while fetching profile summary`,
      };
    }

    const payload = (await response.json()) as PlayerSummariesResponse;
    const player = payload.response.players?.[0];

    if (!player) {
      return {
        success: false,
        data: null,
        isPrivate: false,
        error: "Steam profile not found",
      };
    }

    return {
      success: true,
      isPrivate: false,
      data: {
        steamId: player.steamid,
        personaName: player.personaname,
        profileUrl: player.profileurl,
        avatarFull: player.avatarfull,
      },
    };
  }

  async getPlayerItems(steamId: string): Promise<SteamRequestResult<SteamItem[]>> {
    const response = await fetch(
      `${STEAM_API_BASE}/IEconItems_${TF2_APP_ID}/GetPlayerItems/v1/?key=${this.apiKey}&steamid=${steamId}`,
    );

    if (!response.ok) {
      return {
        success: false,
        data: [],
        isPrivate: false,
        error: `Steam API error (${response.status}) while fetching inventory`,
      };
    }

    const payload = (await response.json()) as InventoryResponse;

    if (payload.result.status === 15) {
      return {
        success: false,
        data: [],
        isPrivate: true,
        error: "Inventory is private",
      };
    }

    if (payload.result.status !== 1) {
      return {
        success: false,
        data: [],
        isPrivate: false,
        error: `Inventory fetch failed (status: ${payload.result.status})`,
      };
    }

    return {
      success: true,
      data: payload.result.items ?? [],
      isPrivate: false,
    };
  }

  async getPlayerAchievements(steamId: string): Promise<SteamRequestResult<SteamAchievement[]>> {
    const response = await fetch(
      `${STEAM_API_BASE}/ISteamUserStats/GetPlayerAchievements/v1/?key=${this.apiKey}&steamid=${steamId}&appid=${TF2_APP_ID}`,
    );

    if (!response.ok) {
      return {
        success: false,
        data: [],
        isPrivate: false,
        error: `Steam API error (${response.status}) while fetching achievements`,
      };
    }

    const payload = (await response.json()) as AchievementsResponse;

    if (!payload.playerstats.success) {
      const error = payload.playerstats.error ?? "Failed to fetch achievements";
      const isPrivate = /private/i.test(error);
      return {
        success: false,
        data: [],
        isPrivate,
        error,
      };
    }

    return {
      success: true,
      data: payload.playerstats.achievements ?? [],
      isPrivate: false,
    };
  }
}

export const BADGE_DEFINDEX_TO_TIER: Record<number, BadgeTier> = {
  170: "platinum",
  164: "gold",
  165: "silver",
  166: "bronze",
};
