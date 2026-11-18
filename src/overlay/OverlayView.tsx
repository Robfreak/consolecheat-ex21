import { useEffect, useState } from "react";
import { parseHash, type Config } from "./config.ts";
import { useLivePad } from "./live.ts";
import { copy } from "./messages.ts";
import { Overlay } from "./Overlay.tsx";

// The OBS view: only the controller drawing on a transparent page. No header, footer, or storage.

export function OverlayView() {
  const [config, setConfig] = useState<Config>(() => parseHash(location.hash));
  const live = useLivePad(config.pad, config.demo);
  const text = copy[config.lang];

  useEffect(() => {
    const sync = () => setConfig(parseHash(location.hash));
    window.addEventListener("hashchange", sync);
    return () => window.removeEventListener("hashchange", sync);
  }, []);

  useEffect(() => {
    document.title = `${text.title} · Overlay`;
    document.documentElement.lang = config.lang;
  }, [config.lang, text.title]);

  const hint = !live.connected && !config.demo && config.hint ? text.hintPress : null;
  return (
    <main className="overlay-root" data-testid="overlay-view">
      <Overlay config={config} state={live.state} hint={hint} label={text.overlayLabel} />
    </main>
  );
}
