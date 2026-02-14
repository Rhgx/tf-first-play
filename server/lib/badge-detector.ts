import type { BadgeTier, LookupResponse } from "../../lib/types";
import type { ItemAttribute, SteamItem } from "./steam";
import { BADGE_DEFINDEX_TO_TIER } from "./steam";

const HIRE_DATE_ATTRIBUTE_DEFINDEXES = [143];

const BADGE_NAMES: Record<keyof typeof BADGE_DEFINDEX_TO_TIER | number, string> = {
  170: "Primeval Warrior",
  164: "Grizzled Veteran",
  165: "Soldier of Fortune",
  166: "Mercenary",
};

const BADGE_ICONS: Record<BadgeTier, string> = {
  platinum: "/images/badges/primeval-warrior.png",
  gold: "/images/badges/grizzled-veteran.png",
  silver: "/images/badges/soldier-of-fortune.png",
  bronze: "/images/badges/mercenary.png",
};

export function createUnknownBadge(reason: string): LookupResponse["badge"] {
  return {
    found: false,
    iconUrl: "/images/badges/unknown.png",
    isPlaceholder: true,
    hireDateIso: null,
    reason,
  };
}

function extractHireDate(attributes: ItemAttribute[] | undefined): string | null {
  if (!attributes || attributes.length === 0) {
    return null;
  }

  for (const attribute of attributes) {
    if (!HIRE_DATE_ATTRIBUTE_DEFINDEXES.includes(attribute.defindex)) {
      continue;
    }

    const timestamp = attribute.value ?? attribute.float_value;
    if (typeof timestamp === "number" && timestamp > 0) {
      return new Date(timestamp * 1000).toISOString();
    }
  }

  const minTimestamp = 1191974400;
  const nowTimestamp = Math.floor(Date.now() / 1000);

  for (const attribute of attributes) {
    const timestamp = attribute.value ?? attribute.float_value;
    if (typeof timestamp === "number" && timestamp >= minTimestamp && timestamp <= nowTimestamp) {
      return new Date(timestamp * 1000).toISOString();
    }
  }

  return null;
}

export function detectBadge(items: SteamItem[]): LookupResponse["badge"] {
  for (const item of items) {
    const tier = BADGE_DEFINDEX_TO_TIER[item.defindex];
    if (!tier) {
      continue;
    }

    const hireDateIso = extractHireDate(item.attributes);
    return {
      found: true,
      tier,
      name: BADGE_NAMES[item.defindex],
      hireDateIso,
      iconUrl: BADGE_ICONS[tier],
      isPlaceholder: false,
      reason: hireDateIso
        ? undefined
        : "Badge found but hire date was not present in API attributes.",
    };
  }

  return createUnknownBadge("No Mercenary badge was found in the public inventory data.");
}
