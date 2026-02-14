import type { ReactNode } from "react";

interface HudShellProps {
  children: ReactNode;
}

export function HudShell({ children }: HudShellProps) {
  return (
    <div className="hud-scene relative">
      <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-[1400px] flex-col px-4 py-6 md:px-8 md:py-10">
        <main className="min-w-0 flex-1">{children}</main>
      </div>
    </div>
  );
}
