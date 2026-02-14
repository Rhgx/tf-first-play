import { FormEvent } from "react";

interface StartLookupPanelProps {
  value: string;
  isLoading: boolean;
  onChange: (value: string) => void;
  onSubmit: () => void;
}

export function StartLookupPanel({ value, isLoading, onChange, onSubmit }: StartLookupPanelProps) {
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onSubmit();
  }

  return (
    <section className="hud-panel mx-auto max-w-[720px] p-6 md:p-8">
      <h2 className="hud-title text-xl text-hud-tanLight md:text-2xl">Start Lookup</h2>
      <p className="mt-2 text-sm text-hud-tanLight/75">
        Enter a Steam64 ID, vanity URL, or profile URL to load badge and achievement timeline data.
      </p>

      <form className="mt-5 space-y-3" onSubmit={handleSubmit}>
        <input
          className="w-full border border-hud-tanDark/80 bg-black/35 px-3 py-3 text-sm text-hud-tanLight placeholder:text-hud-tanLight/45 focus:border-hud-orange focus:outline-none"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder="Steam64 ID, vanity, or profile URL"
        />
        <button className="hud-button mx-auto block text-sm" type="submit" disabled={isLoading}>
          {isLoading ? "Scanning..." : "Find Player"}
        </button>
      </form>
    </section>
  );
}
