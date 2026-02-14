interface StatusBannerProps {
  kind: "info" | "warning" | "error";
  message: string;
}

const kindStyles: Record<StatusBannerProps["kind"], string> = {
  info: "border-hud-tanDark/70 text-hud-tanLight",
  warning: "border-orange-300/60 text-orange-100",
  error: "border-red-400/70 text-red-100",
};

export function StatusBanner({ kind, message }: StatusBannerProps) {
  return <div className={`hud-panel border px-3 py-2 text-sm ${kindStyles[kind]}`}>{message}</div>;
}
