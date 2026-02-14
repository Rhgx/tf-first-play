import { FormEvent } from "react";

interface SearchPanelProps {
  value: string;
  isLoading: boolean;
  onChange: (value: string) => void;
  onSubmit: () => void;
}

export function SearchPanel({ value, isLoading, onChange, onSubmit }: SearchPanelProps) {
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onSubmit();
  }

  return (
    <div className="hud-panel p-4">
      <h2 className="hud-title mb-3 text-sm text-hud-tanLight">Player Search</h2>
      <form className="space-y-3" onSubmit={handleSubmit}>
        <input
          className="w-full border border-hud-tanDark/80 bg-black/35 px-3 py-2 text-sm text-hud-tanLight placeholder:text-hud-tanLight/45 focus:border-hud-orange focus:outline-none"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder="Steam64 ID, vanity, or profile URL"
        />
        <button className="hud-button text-sm" type="submit" disabled={isLoading}>
          {isLoading ? "Scanning..." : "Scan Profile"}
        </button>
      </form>
    </div>
  );
}
