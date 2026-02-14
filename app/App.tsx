"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { lookupSteamProfile } from "@/lib/api-client";
import type { LookupResponse } from "@/lib/types";
import { HudShell } from "@/components/HudShell";
import { StartLookupPanel } from "@/components/StartLookupPanel";
import { ProfileHeader } from "@/components/ProfileHeader";
import { BadgePanel } from "@/components/BadgePanel";
import { AchievementsTimeline } from "@/components/AchievementsTimeline";
import { StatusBanner } from "@/components/StatusBanner";
import { ScreenshotCard } from "@/components/ScreenshotCard";
import { captureShareCard } from "@/lib/screenshot";
import { toProxyImageUrl } from "@/lib/url";

const defaultBadge: LookupResponse["badge"] = {
  found: false,
  iconUrl: "/images/badges/unknown.png",
  isPlaceholder: true,
  reason: "Run a search to check this player's badge and hire date.",
  hireDateIso: null,
};

const USER_ROUTE_PREFIX = "/user/";

function getUserInputFromPath(pathname: string): string | null {
  if (!pathname.startsWith(USER_ROUTE_PREFIX)) {
    return null;
  }

  const suffix = pathname.slice(USER_ROUTE_PREFIX.length).trim();
  if (!suffix) {
    return null;
  }

  return decodeURIComponent(suffix);
}

function App() {
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [captureGeneratedAtIso, setCaptureGeneratedAtIso] = useState<string>(() => new Date().toISOString());
  const [screenshotStatus, setScreenshotStatus] = useState<{ kind: "info" | "warning" | "error"; message: string } | null>(null);
  const [response, setResponse] = useState<LookupResponse | null>(null);
  const screenshotCardRef = useRef<HTMLDivElement | null>(null);

  const warnings = response?.warnings ?? [];

  const badge = useMemo(() => {
    if (!response) {
      return defaultBadge;
    }

    return {
      ...defaultBadge,
      ...response.badge,
      iconUrl: response.badge.iconUrl || defaultBadge.iconUrl,
    };
  }, [response]);

  const screenshotResponse = useMemo(() => {
    if (!response) {
      return null;
    }

    return {
      ...response,
      profile: response.profile
        ? {
            ...response.profile,
            avatarFull: toProxyImageUrl(response.profile.avatarFull) ?? "/images/badges/unknown.png",
          }
        : null,
      badge: {
        ...response.badge,
        iconUrl: toProxyImageUrl(response.badge.iconUrl) ?? "/images/badges/unknown.png",
      },
      achievements: {
        ...response.achievements,
        items: response.achievements.items.map((item) => ({
          ...item,
          iconUrl: toProxyImageUrl(item.iconUrl) ?? "/images/badges/unknown.png",
        })),
      },
    };
  }, [response]);

  const performLookup = useCallback(async (rawInput: string, updateUrl: boolean) => {
    const trimmed = rawInput.trim();
    if (!trimmed) {
      setErrorMessage("Enter a Steam64 ID, vanity URL, or profile URL.");
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);
    setScreenshotStatus(null);

    try {
      const result = await lookupSteamProfile(trimmed);
      setResponse(result);

      if (updateUrl) {
        const suffix = result.query.steamId ?? trimmed;
        window.history.pushState({}, "", `${USER_ROUTE_PREFIX}${encodeURIComponent(suffix)}`);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Lookup failed.";
      setErrorMessage(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  function submitLookup() {
    void performLookup(input, true);
  }

  async function takeScreenshot() {
    if (!response) {
      return;
    }

    const steamId = response.profile?.steamId ?? response.query.steamId;
    if (!steamId) {
      setScreenshotStatus({
        kind: "error",
        message: "Screenshot unavailable: missing SteamID.",
      });
      return;
    }

    if (!screenshotCardRef.current) {
      setScreenshotStatus({
        kind: "error",
        message: "Screenshot unavailable: capture card is not ready.",
      });
      return;
    }

    const generatedAtIso = new Date().toISOString();
    setCaptureGeneratedAtIso(generatedAtIso);
    setIsCapturing(true);
    setScreenshotStatus(null);

    try {
      await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
      const result = await captureShareCard(screenshotCardRef.current, steamId, generatedAtIso);

      if (result.copied && result.downloaded) {
        setScreenshotStatus({
          kind: "info",
          message: `Screenshot copied to clipboard and downloaded as ${result.fileName}.`,
        });
      } else if (!result.copied && result.downloaded) {
        setScreenshotStatus({
          kind: "warning",
          message: `Screenshot downloaded as ${result.fileName}. Clipboard copy is not available in this browser.`,
        });
      } else {
        setScreenshotStatus({
          kind: "warning",
          message: "Screenshot generated, but download or clipboard copy was incomplete.",
        });
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Screenshot generation failed.";
      setScreenshotStatus({
        kind: "error",
        message,
      });
    } finally {
      setIsCapturing(false);
    }
  }

  function goBackToStart() {
    setErrorMessage(null);
    setScreenshotStatus(null);
    setResponse(null);
    setIsLoading(false);
    window.history.pushState({}, "", "/");
  }

  useEffect(() => {
    const routeInput = getUserInputFromPath(window.location.pathname);
    if (routeInput) {
      setInput(routeInput);
      void performLookup(routeInput, false);
    }

    function handlePopState() {
      const poppedInput = getUserInputFromPath(window.location.pathname);
      if (poppedInput) {
        setInput(poppedInput);
        void performLookup(poppedInput, false);
        return;
      }

      setErrorMessage(null);
      setScreenshotStatus(null);
      setResponse(null);
      setIsLoading(false);
    }

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [performLookup]);

  const isUserPage = Boolean(response);
  const routeLabel = typeof window === "undefined" ? "/" : `${window.location.origin}${window.location.pathname}`;

  return (
    <HudShell>
      {!isUserPage ? (
        <div className="flex min-h-[75vh] items-center justify-center">
          <div className="w-full space-y-4">
            {errorMessage && <StatusBanner kind="error" message={errorMessage} />}
            <StartLookupPanel value={input} onChange={setInput} onSubmit={submitLookup} isLoading={isLoading} />
          </div>
        </div>
      ) : response ? (
        <div className="mt-8 space-y-5">
          {screenshotStatus && <StatusBanner kind={screenshotStatus.kind} message={screenshotStatus.message} />}
          {errorMessage && <StatusBanner kind="error" message={errorMessage} />}
          {warnings.map((warning) => (
            <StatusBanner key={warning} kind="warning" message={warning} />
          ))}

          <ProfileHeader profile={response.profile} onBack={goBackToStart} onScreenshot={takeScreenshot} isCapturing={isCapturing} />
          <BadgePanel badge={badge} />
          <AchievementsTimeline items={response.achievements.items} />

          {screenshotResponse ? (
            <div aria-hidden className="pointer-events-none fixed left-[-99999px] top-0 opacity-0">
              <div ref={screenshotCardRef}>
                <ScreenshotCard
                  response={screenshotResponse}
                  badge={screenshotResponse.badge}
                  generatedAtIso={captureGeneratedAtIso}
                  routeLabel={routeLabel}
                />
              </div>
            </div>
          ) : null}
        </div>
      ) : null}
    </HudShell>
  );
}

export default App;
