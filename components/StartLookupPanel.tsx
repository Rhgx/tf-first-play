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
    <section className="hud-panel mx-auto max-w-[920px] animate-fade-in-up p-5 sm:p-8 md:p-10">
      <h2 className="hud-title text-2xl text-hud-tanLight md:text-3xl">Start Lookup</h2>
      <p className="mt-3 text-base text-hud-tanLight/75">
        Enter a Steam64 ID, vanity URL, or profile URL to load badge and achievement timeline data.
      </p>

      <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
        <input
          className="w-full border border-hud-tanDark/80 bg-black/35 px-4 py-4 text-base text-hud-tanLight transition-colors duration-150 placeholder:text-hud-tanLight/45 focus:border-hud-orange focus:outline-none"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder="Steam64 ID, vanity, or profile URL"
        />
        <button className="hud-button mx-auto block text-base" type="submit" disabled={isLoading}>
          <span className={isLoading ? "animate-pulse-soft inline-block" : undefined}>{isLoading ? "Scanning..." : "Find Player"}</span>
        </button>
      </form>
    </section>
  );
}
