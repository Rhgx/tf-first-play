import { formatDateTimeGmt } from "@/lib/date";
import type { AchievementView } from "@/lib/types";

interface AchievementsTimelineProps {
  items: AchievementView[];
}

export function AchievementsTimeline({ items }: AchievementsTimelineProps) {
  return (
    <section className="hud-panel p-4">
      <div className="mb-3 flex items-end justify-between gap-3">
        <h2 className="hud-title text-lg">Achievements Timeline</h2>
        <span className="text-xs text-hud-tanLight/70">Unlocked: {items.length}</span>
      </div>

      {items.length === 0 ? (
        <p className="text-sm text-hud-tanLight/70">No unlocked achievements were returned for this profile.</p>
      ) : (
        <ul className="max-h-[420px] space-y-2 overflow-y-auto pr-1">
          {items.map((achievement) => (
            <li key={`${achievement.apiName}-${achievement.unlockTime}`} className="flex items-center gap-3 border border-hud-tanDark/40 bg-black/25 p-2">
              <img
                src={achievement.iconUrl}
                alt={achievement.displayName}
                className="h-12 w-12 shrink-0 border border-hud-tanDark/80 bg-black/40 object-contain"
                loading="lazy"
                referrerPolicy="no-referrer"
              />
              <div className="min-w-0">
                <p className="truncate text-sm text-hud-tanLight">{achievement.displayName}</p>
                <p className="text-xs text-hud-tanLight/70">{formatDateTimeGmt(achievement.unlockDateIso)}</p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
