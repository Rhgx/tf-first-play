import type { ReactNode } from "react";

interface HudShellProps {
  children: ReactNode;
}

export function HudShell({ children }: HudShellProps) {
  return (
    <div className="hud-scene relative">
      <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-[1800px] flex-col px-3 py-5 sm:px-6 sm:py-8 md:px-14 md:py-12">
        <main className="min-w-0 flex-1">{children}</main>
      </div>
    </div>
  );
}
