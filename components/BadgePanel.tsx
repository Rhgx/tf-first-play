import { formatDateTimeGmt } from "@/lib/date";
import type { LookupResponse } from "@/lib/types";

interface BadgePanelProps {
  badge: LookupResponse["badge"];
}

const tierLabel: Record<string, string> = {
  platinum: "Primeval Warrior",
  gold: "Grizzled Veteran",
  silver: "Soldier of Fortune",
  bronze: "Mercenary",
};

export function BadgePanel({ badge }: BadgePanelProps) {
  const title = badge.found ? badge.name ?? (badge.tier ? tierLabel[badge.tier] : "Mercenary Badge") : "Badge Not Found";
  const shouldShowReason = Boolean(badge.reason) && (!badge.found || !badge.hireDateIso);

  return (
    <section className="hud-panel animate-fade-in opacity-0 p-6" style={{ animationDelay: "0.1s" }}>
      <h2 className="hud-title text-xl">Mercenary Badge</h2>
      <div className="mt-4 flex flex-col gap-5 sm:flex-row">
        <img
          src={badge.iconUrl}
          alt={badge.found ? `${title} icon` : "Unknown mercenary badge"}
          className="h-36 w-36 rounded-sm border border-hud-tanDark/90 bg-black/30 object-contain p-2"
          referrerPolicy="no-referrer"
        />
        <div className="min-w-0">
          <p className="hud-title text-lg text-hud-tanLight">{title}</p>
          <p className="mt-1 text-base text-hud-tanLight/85">
            Tier: <span className="uppercase">{badge.tier ?? "unknown"}</span>
          </p>
          <p className="mt-1 text-base text-hud-tanLight/85">Hire Date: {formatDateTimeGmt(badge.hireDateIso ?? null)}</p>
          {shouldShowReason ? <p className="mt-2 text-sm text-hud-tanLight/70">{badge.reason}</p> : null}
        </div>
      </div>
    </section>
  );
}
