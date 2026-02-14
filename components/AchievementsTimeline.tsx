import { formatDateTimeGmt } from "@/lib/date";
import type { AchievementView } from "@/lib/types";

interface AchievementsTimelineProps {
  items: AchievementView[];
}

export function AchievementsTimeline({ items }: AchievementsTimelineProps) {
  return (
    <section className="hud-panel animate-fade-in opacity-0 p-6" style={{ animationDelay: "0.15s" }}>
      <div className="mb-4 flex items-end justify-between gap-4">
        <h2 className="hud-title text-xl">Achievements Timeline</h2>
        <span className="text-sm text-hud-tanLight/70">Unlocked: {items.length}</span>
      </div>

      {items.length === 0 ? (
        <p className="text-base text-hud-tanLight/70">No unlocked achievements were returned for this profile.</p>
      ) : (
        <ul className="max-h-[600px] space-y-2.5 overflow-y-auto pr-1">
          {items.map((achievement, index) => (
            <li
              key={`${achievement.apiName}-${achievement.unlockTime}`}
              className="animate-fade-in-up flex items-center gap-4 border border-hud-tanDark/40 bg-black/25 p-3 opacity-0"
              style={{ animationDelay: `${0.2 + index * 0.03}s` }}
            >
              <img
                src={achievement.iconUrl}
                alt={achievement.displayName}
                className="h-14 w-14 shrink-0 border border-hud-tanDark/80 bg-black/40 object-contain"
                loading="lazy"
                referrerPolicy="no-referrer"
              />
              <div className="min-w-0">
                <p className="truncate text-base text-hud-tanLight">{achievement.displayName}</p>
                <p className="text-sm text-hud-tanLight/70">{formatDateTimeGmt(achievement.unlockDateIso)}</p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
