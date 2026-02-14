import type { Metadata } from "next";
import "@/styles/globals.css";
import "@/styles/hud-theme.css";

export const metadata: Metadata = {
  title: "TF2 First Play Date Finder",
  description:
    "Look up any Steam profile to discover when they first played Team Fortress 2, their Mercenary badge tier, and earliest achievement unlocks.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <div id="root">{children}</div>
      </body>
    </html>
  );
}
