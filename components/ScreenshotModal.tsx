"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { X, Copy, Download } from "lucide-react";

interface ScreenshotModalProps {
  imageUrl: string;
  fileName: string;
  onCopy: () => Promise<boolean>;
  onDownload: () => void;
  onClose: () => void;
}

export function ScreenshotModal({
  imageUrl,
  fileName,
  onCopy,
  onDownload,
  onClose,
}: ScreenshotModalProps) {
  const [copyStatus, setCopyStatus] = useState<"idle" | "success" | "error">("idle");

  async function handleCopy() {
    setCopyStatus("idle");
    const ok = await onCopy();
    setCopyStatus(ok ? "success" : "error");
    if (ok) {
      setTimeout(() => setCopyStatus("idle"), 2000);
    }
  }

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  const modal = (
    <div
      className="fixed inset-0 z-[9999] flex min-h-[100dvh] min-w-[100vw] items-center justify-center bg-black/70 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="screenshot-modal-title"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="hud-panel relative flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden border border-hud-tanDark/50 shadow-2xl animate-fade-in-up"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex shrink-0 items-center justify-between border-b border-hud-tanDark/40 px-4 py-3">
          <h2 id="screenshot-modal-title" className="hud-title text-lg text-hud-tanLight">
            Screenshot
          </h2>
          <button
            type="button"
            aria-label="Close"
            className="flex h-8 w-8 items-center justify-center rounded border-0 bg-transparent text-hud-tanLight opacity-80 transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-hud-tanLight/50"
            onClick={onClose}
          >
            <X size={20} strokeWidth={2} />
          </button>
        </div>

        <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-auto p-4">
          <div className="flex min-h-0 justify-center rounded border border-hud-tanDark/40 bg-black/40 p-2">
            <img
              src={imageUrl}
              alt="Screenshot preview"
              className="max-h-[55vh] w-auto max-w-full object-contain"
            />
          </div>

          <div className="flex flex-nowrap items-center justify-center gap-3">
            <button
              type="button"
              className="hud-button flex h-9 flex-1 items-center justify-center gap-2 px-4 text-sm"
              onClick={() => void handleCopy()}
            >
              <Copy size={18} />
              <span>
                {copyStatus === "success" ? "Copied!" : copyStatus === "error" ? "Copy failed" : "Copy"}
              </span>
            </button>
            <button
              type="button"
              className="hud-button flex h-9 flex-1 items-center justify-center gap-2 px-4 text-sm"
              onClick={onDownload}
            >
              <Download size={18} />
              <span>Download</span>
            </button>
          </div>
          <p className="text-xs text-hud-tanLight/60" title={fileName}>
            {fileName}
          </p>
        </div>
      </div>
    </div>
  );

  if (typeof document === "undefined") return null;
  return createPortal(modal, document.body);
}
