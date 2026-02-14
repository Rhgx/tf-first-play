import { Camera, ArrowLeft } from "lucide-react";
import type { LookupResponse } from "@/lib/types";

interface ProfileHeaderProps {
  profile: LookupResponse["profile"];
  onBack: () => void;
  onScreenshot: () => void;
  isCapturing: boolean;
}

export function ProfileHeader({ profile, onBack, onScreenshot, isCapturing }: ProfileHeaderProps) {
  if (!profile) {
    return (
      <section className="hud-panel p-6">
        <div className="flex items-start justify-between gap-4">
          <h2 className="hud-title text-xl">Profile</h2>
          <div className="flex items-center gap-2">
            <button
              aria-label="Capture screenshot"
              className="hud-icon-button"
              onClick={onScreenshot}
              title="Capture screenshot"
              type="button"
              disabled={isCapturing}
            >
              <Camera size={20} />
            </button>
            <button
              aria-label="Back to lookup"
              className="hud-icon-button"
              onClick={onBack}
              title="Back to lookup"
              type="button"
            >
              <ArrowLeft size={20} />
            </button>
          </div>
        </div>
        <p className="mt-3 text-base text-hud-tanLight/70">Search a Steam profile to load avatar and account details.</p>
      </section>
    );
  }

  return (
    <section className="hud-panel animate-fade-in opacity-0 p-6" style={{ animationDelay: "0.05s" }}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-5">
          <img
            alt={`${profile.personaName} avatar`}
            src={profile.avatarFull}
            className="h-24 w-24 rounded-sm border border-hud-tanDark/80 object-cover"
            referrerPolicy="no-referrer"
          />
          <div>
            <h2 className="hud-title text-2xl">{profile.personaName}</h2>
            <p className="text-base text-hud-tanLight/80">Steam64: {profile.steamId}</p>
            <a href={profile.profileUrl} target="_blank" rel="noreferrer" className="text-base text-hud-orange underline">
              Open Steam Profile
            </a>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            aria-label="Capture screenshot"
            className="hud-icon-button"
            onClick={onScreenshot}
            title="Capture screenshot"
            type="button"
            disabled={isCapturing}
          >
            <Camera size={20} />
          </button>
          <button
            aria-label="Back to lookup"
            className="hud-icon-button"
            onClick={onBack}
            title="Back to lookup"
            type="button"
          >
            <ArrowLeft size={20} />
          </button>
        </div>
      </div>
    </section>
  );
}
