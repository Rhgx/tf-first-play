import { formatDateTimeGmt } from "@/lib/date";
import type { LookupResponse } from "@/lib/types";

interface ScreenshotCardProps {
  response: LookupResponse;
  badge: LookupResponse["badge"];
  generatedAtIso: string;
  routeLabel: string;
}

export function ScreenshotCard({ response, badge, generatedAtIso, routeLabel }: ScreenshotCardProps) {
  const profile = response.profile;
  const achievementRows = response.achievements.items.slice(0, 8);

  return (
    <section
      className="hud-panel w-[1080px] p-10 text-hud-tanLight"
      style={{
        background:
          "linear-gradient(160deg, rgba(46,43,42,0.98), rgba(31,28,27,0.97)), radial-gradient(circle at 15% 10%, rgba(145,73,59,0.18), transparent 35%)",
      }}
    >
      <header className="mb-8 border-b border-hud-tanDark/50 pb-5">
        <p className="text-sm uppercase tracking-[0.18em] text-hud-tanLight/75">TF2 First Play Share Card</p>
        <p className="mt-1 text-2xl font-tf2Build">{profile?.personaName ?? "Unknown Player"}</p>
        <p className="mt-1 text-sm text-hud-tanLight/75">Steam64: {profile?.steamId ?? response.query.steamId ?? "unknown"}</p>
      </header>

      <div className="grid grid-cols-[320px_1fr] gap-8">
        <div className="space-y-5">
          <div className="hud-panel border border-hud-tanDark/40 p-4">
            <p className="text-xs uppercase tracking-[0.12em] text-hud-tanLight/70">Profile</p>
            <img
              alt="profile"
              className="mt-3 h-52 w-52 rounded-sm border border-hud-tanDark/70 object-cover"
              src={profile?.avatarFull ?? "/images/badges/unknown.png"}
            />
          </div>

          <div className="hud-panel border border-hud-tanDark/40 p-4">
            <p className="text-xs uppercase tracking-[0.12em] text-hud-tanLight/70">Mercenary Badge</p>
            <img alt="badge" className="mt-3 h-36 w-36 border border-hud-tanDark/70 bg-black/35 p-2" src={badge.iconUrl} />
            <p className="mt-3 text-lg font-tf2Build">{badge.name ?? "Badge Not Found"}</p>
            <p className="text-sm text-hud-tanLight/80">Tier: {(badge.tier ?? "unknown").toUpperCase()}</p>
            <p className="text-sm text-hud-tanLight/80">Hire Date: {formatDateTimeGmt(badge.hireDateIso ?? null)}</p>
          </div>

          <div className="hud-panel border border-hud-tanDark/40 p-4">
            <p className="text-xs uppercase tracking-[0.12em] text-hud-tanLight/70">Achievements</p>
            <p className="mt-2 text-sm">Unlocked: {response.achievements.unlockedCount}</p>
            <p className="text-sm">Earliest: {formatDateTimeGmt(response.achievements.earliestUnlockIso ?? null)}</p>
          </div>
        </div>

        <div className="hud-panel border border-hud-tanDark/40 p-5">
          <div className="mb-3 flex items-end justify-between">
            <h2 className="font-tf2Build text-2xl">Chronological Achievements</h2>
            <p className="text-xs uppercase tracking-[0.12em] text-hud-tanLight/70">Top 8</p>
          </div>

          {achievementRows.length === 0 ? (
            <p className="mt-4 text-sm text-hud-tanLight/70">No unlocked achievements found.</p>
          ) : (
            <ul className="space-y-2">
              {achievementRows.map((achievement) => (
                <li key={`${achievement.apiName}-${achievement.unlockTime}`} className="flex items-center gap-3 border border-hud-tanDark/35 bg-black/20 p-2">
                  <img
                    alt={achievement.displayName}
                    className="h-12 w-12 border border-hud-tanDark/60 bg-black/35 object-contain"
                    src={achievement.iconUrl || "/images/badges/unknown.png"}
                  />
                  <div className="min-w-0">
                    <p className="truncate text-sm">{achievement.displayName}</p>
                    <p className="text-xs text-hud-tanLight/70">{formatDateTimeGmt(achievement.unlockDateIso)}</p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <footer className="mt-7 flex items-center justify-between border-t border-hud-tanDark/45 pt-4 text-xs text-hud-tanLight/70">
        <p>Generated: {formatDateTimeGmt(generatedAtIso)}</p>
        <p>{routeLabel}</p>
      </footer>
    </section>
  );
}
