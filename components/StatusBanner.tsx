import { useCallback, useEffect, useRef, useState } from "react";
import { X } from "lucide-react";

interface StatusBannerProps {
  kind: "info" | "warning" | "error";
  message: string;
  onClose?: () => void;
  autoDismissAfter?: number;
}

const kindStyles: Record<StatusBannerProps["kind"], string> = {
  info: "border-hud-tanDark/70 text-hud-tanLight",
  warning: "border-orange-300/60 text-orange-100",
  error: "border-red-400/70 text-red-100",
};

const AUTO_DISMISS_MS = 10_000;
const EXIT_ANIMATION_MS = 250;

export function StatusBanner({ kind, message, onClose, autoDismissAfter = AUTO_DISMISS_MS }: StatusBannerProps) {
  const [isExiting, setIsExiting] = useState(false);
  const exitTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isExitingRef = useRef(false);

  const startExit = useCallback(() => {
    if (onClose == null || isExitingRef.current) return;
    isExitingRef.current = true;
    setIsExiting(true);
    exitTimerRef.current = window.setTimeout(() => {
      exitTimerRef.current = null;
      onClose();
    }, EXIT_ANIMATION_MS);
  }, [onClose]);

  useEffect(() => {
    if (onClose == null || autoDismissAfter <= 0) return;
    const id = window.setTimeout(startExit, autoDismissAfter);
    return () => window.clearTimeout(id);
  }, [onClose, autoDismissAfter, startExit]);

  useEffect(() => {
    return () => {
      if (exitTimerRef.current != null) window.clearTimeout(exitTimerRef.current);
    };
  }, []);

  return (
    <div
      className={`hud-panel relative border px-4 py-3 pr-10 text-base ${kindStyles[kind]} ${isExiting ? "animate-fade-out" : "animate-fade-in"}`}
    >
      <span className="block">{message}</span>
      {onClose ? (
        <button
          type="button"
          aria-label="Dismiss"
          className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded border-0 bg-transparent text-current opacity-70 transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-hud-tanLight/50"
          onClick={startExit}
        >
          <X size={18} strokeWidth={2} />
        </button>
      ) : null}
    </div>
  );
}
