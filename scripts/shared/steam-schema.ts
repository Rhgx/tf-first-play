export interface SteamSchemaAchievement {
  name: string;
  displayName: string;
  description?: string;
  icon: string;
  icongray?: string;
}

interface SchemaResponse {
  game: {
    availableGameStats?: {
      achievements?: SteamSchemaAchievement[];
    };
  };
}

export async function fetchSteamSchema(apiKey: string): Promise<SteamSchemaAchievement[]> {
  if (!apiKey) {
    throw new Error("STEAM_API_KEY is required to fetch Steam schema");
  }

  const endpoint = `https://api.steampowered.com/ISteamUserStats/GetSchemaForGame/v2/?key=${apiKey}&appid=440&l=en`;
  const response = await fetch(endpoint);

  if (!response.ok) {
    throw new Error(`Failed to fetch Steam schema (${response.status})`);
  }

  const payload = (await response.json()) as SchemaResponse;
  return payload.game.availableGameStats?.achievements ?? [];
}
