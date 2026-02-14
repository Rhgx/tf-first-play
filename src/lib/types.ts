export type BadgeTier = "platinum" | "gold" | "silver" | "bronze";

export interface AchievementView {
  apiName: string;
  displayName: string;
  unlockTime: number;
  unlockDateIso: string;
  iconUrl: string;
  source: "wiki" | "steam";
  wikiUrl?: string;
}

export interface LookupResponse {
  query: {
    rawInput: string;
    steamId?: string;
  };
  profile: {
    steamId: string;
    personaName: string;
    profileUrl: string;
    avatarFull: string;
  } | null;
  badge: {
    found: boolean;
    name?: string;
    tier?: BadgeTier;
    hireDateIso?: string | null;
    iconUrl: string;
    isPlaceholder: boolean;
    reason?: string;
  };
  achievements: {
    unlockedCount: number;
    earliestUnlockIso?: string | null;
    items: AchievementView[];
  };
  privacy: {
    inventoryPrivate: boolean;
    achievementsPrivate: boolean;
  };
  warnings: string[];
  errors?: string[];
}

export interface LookupRequest {
  input: string;
}
