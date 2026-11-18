import { useEffect, useRef, useState } from "react";
import { DEFAULT_CONFIG, LIMITS, SKINS, overlaySize, overlayUrl, parseHash, type Config, type PadIndex, type Skin } from "./config.ts";
import { useLivePad } from "./live.ts";
import { fill, type Copy, type Lang } from "./messages.ts";
import { Overlay } from "./Overlay.tsx";
import { SKIN_DEFS } from "./skins.ts";
import { loadConfig, saveConfig, type StorageLike } from "./storage.ts";

function browserStorage(): StorageLike | null {
  try {
    localStorage.getItem("consolecheat-theme");
    return localStorage;
  } catch {
    return null;
  }
}

/** Config from the hash when it carries settings, else the saved one, else the defaults. */
function initialConfig(storage: StorageLike | null): { config: Config; corrupt: boolean } {
  const hash = location.hash.replace(/^#/, "");
  if (hash.includes("=")) return { config: parseHash(hash), corrupt: false };
  const saved = storage ? loadConfig(storage) : { config: null, corrupt: false };
  return { config: saved.config ?? { ...DEFAULT_CONFIG }, corrupt: saved.corrupt };
}

function Range({ id, label, value, min, max, step, onChange }: { id: string; label: string; value: number; min: number; max: number; step: number; onChange: (v: number) => void }) {
  return (
    <div className="range-row">
      <label htmlFor={id} className="text-sm font-medium text-muted">
        {label}
      </label>
      <input id={id} type="range" min={min} max={max} step={step} value={value} className="range" onChange={(e) => onChange(Number(e.target.value))} />
      <output htmlFor={id} className="range-value">
        {value}
      </output>
    </div>
  );
}

function Color({ id, label, value, onChange }: { id: string; label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div className="color-row">
      <input id={id} type="color" value={value} className="swatch" onChange={(e) => onChange(e.target.value)} />
      <label htmlFor={id} className="text-sm font-medium text-muted">
        {label} <span className="font-mono text-xs text-subtle">{value}</span>
      </label>
    </div>
  );
}

function Check({ id, label, checked, onChange }: { id: string; label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-center gap-2">
      <input id={id} type="checkbox" className="size-5 shrink-0" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      <label htmlFor={id} className="text-sm font-medium">
        {label}
      </label>
    </div>
  );
}

export function ConfigPage({ text, lang }: { text: Copy; lang: Lang }) {
  const storage = useRef<StorageLike | null>(null);
  const [initial] = useState(() => {
    storage.current = browserStorage();
    return initialConfig(storage.current);
  });
  const [config, setConfig] = useState<Config>(initial.config);
  const [demoPreview, setDemoPreview] = useState(true);
  const [status, setStatus] = useState(initial.corrupt ? text.configCorrupt : "");
  const dirty = useRef(false);
  const urlField = useRef<HTMLInputElement>(null);
  const live = useLivePad(config.pad, demoPreview);
  const urlConfig: Config = { ...config, lang };
  const url = overlayUrl(location.origin, import.meta.env.BASE_URL, urlConfig);
  const size = overlaySize(config);

  function update(patch: Partial<Config>) {
    dirty.current = true;
    setConfig((c) => ({ ...c, ...patch }));
  }

  useEffect(() => {
    if (!dirty.current || !storage.current) return;
    if (!saveConfig(storage.current, { ...config, lang })) setStatus(text.saveFailed);
  }, [config, lang, text]);

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(url);
      setStatus(text.copied);
    } catch {
      urlField.current?.focus();
      urlField.current?.select();
      setStatus(text.copyFailed);
    }
  }

  const hint = !live.connected && !demoPreview && config.hint ? text.hintPress : null;

  return (
    <div className="config">
      <div className="preview-col">
        <div className="panel rounded-xl px-4 py-4">
          <h3 className="font-display text-lg font-semibold tracking-tight">{text.previewHeading}</h3>
          <div className="checker mt-3" data-testid="preview">
            <Overlay config={config} state={live.state} hint={hint} label={text.overlayLabel} />
          </div>
          <p className="mt-2 text-sm text-subtle">{text.previewNote}</p>
          <p className="mt-1 text-sm text-fg" data-testid="pad-status">
            {live.connected ? fill(text.padConnected, { id: live.padId || "Gamepad" }) : `${text.hintPress}. ${text.hintWhy}`}
          </p>
          <div className="mt-3">
            <Check id="ov-demo-preview" label={text.demoPreview} checked={demoPreview} onChange={setDemoPreview} />
          </div>
        </div>

        <div className="panel mt-4 rounded-xl px-4 py-4">
          <h3 className="font-display text-lg font-semibold tracking-tight">{text.urlHeading}</h3>
          <label htmlFor="ov-url" className="mt-3 block text-sm font-medium text-muted">
            {text.urlLabel}
          </label>
          <input
            id="ov-url"
            ref={urlField}
            data-testid="overlay-url"
            type="text"
            readOnly
            value={url}
            className="field mt-1 font-mono text-sm"
            onFocus={(e) => e.target.select()}
          />
          <div className="mt-3 flex flex-wrap gap-2">
            <button type="button" className="btn btn-primary" data-testid="copy" onClick={() => void copyLink()}>
              {text.copy}
            </button>
            <a className="btn btn-ghost" href={url} target="_blank" rel="noopener" data-testid="open">
              {text.open}
            </a>
          </div>
          <p className="mt-3 min-h-5 text-sm text-fg" role="status" aria-live="polite" data-testid="status">
            {status}
          </p>
          <h4 className="mt-4 font-display text-base font-semibold">{text.obsHeading}</h4>
          <ol className="mt-2 list-decimal space-y-1 pl-5 text-sm leading-relaxed text-muted">
            <li>{text.obs1}</li>
            <li>{text.obs2}</li>
            <li>{fill(text.obs3, { w: size.width, h: size.height })}</li>
            <li>{text.obs4}</li>
            <li>{text.obs5}</li>
          </ol>
        </div>
      </div>

      <fieldset className="panel rounded-xl px-4 py-4">
        <legend className="sr-only">{text.settingsHeading}</legend>
        <h3 className="font-display text-lg font-semibold tracking-tight" aria-hidden="true">
          {text.settingsHeading}
        </h3>
        <div className="mt-3 grid gap-3">
          <div>
            <label htmlFor="ov-skin" className="text-sm font-medium text-muted">
              {text.skinLabel}
            </label>
            <select id="ov-skin" data-testid="skin" className="field mt-1" value={config.skin} onChange={(e) => update({ skin: e.target.value as Skin })}>
              {SKINS.map((id) => (
                <option key={id} value={id}>
                  {SKIN_DEFS[id][lang]}
                </option>
              ))}
            </select>
          </div>
          <Color id="ov-accent" label={text.accentLabel} value={config.accent} onChange={(accent) => update({ accent })} />
          <Color id="ov-base" label={text.baseLabel} value={config.base} onChange={(base) => update({ base })} />
          <Color id="ov-pressed" label={text.pressedLabel} value={config.pressed} onChange={(pressed) => update({ pressed })} />
          <Range id="ov-scale" label={text.scaleLabel} value={config.scale} min={LIMITS.scale[0]} max={LIMITS.scale[1]} step={0.25} onChange={(scale) => update({ scale })} />
          <Range id="ov-opacity" label={text.opacityLabel} value={config.opacity} min={LIMITS.opacity[0]} max={LIMITS.opacity[1]} step={0.05} onChange={(opacity) => update({ opacity })} />
          <Range id="ov-dz" label={text.deadzoneLabel} value={config.deadzone} min={LIMITS.deadzone[0]} max={LIMITS.deadzone[1]} step={0.05} onChange={(deadzone) => update({ deadzone })} />
          <div>
            <label htmlFor="ov-pad" className="text-sm font-medium text-muted">
              {text.padLabel}
            </label>
            <select
              id="ov-pad"
              data-testid="pad"
              className="field mt-1"
              value={String(config.pad)}
              onChange={(e) => update({ pad: (e.target.value === "auto" ? "auto" : Number(e.target.value)) as PadIndex })}
            >
              <option value="auto">{text.padAuto}</option>
              {[0, 1, 2, 3].map((n) => (
                <option key={n} value={n}>
                  {fill(text.padSlot, { n: n + 1 })}
                </option>
              ))}
            </select>
          </div>
          <Check id="ov-sticks" label={text.sticksLabel} checked={config.sticks} onChange={(sticks) => update({ sticks })} />
          <Check id="ov-triggers" label={text.triggersLabel} checked={config.triggers} onChange={(triggers) => update({ triggers })} />
          <Check id="ov-hint" label={text.hintLabel} checked={config.hint} onChange={(hint) => update({ hint })} />
          <Check id="ov-demo" label={text.demoLabel} checked={config.demo} onChange={(demo) => update({ demo })} />
          <button type="button" className="btn btn-ghost self-start" onClick={() => update({ ...DEFAULT_CONFIG })}>
            {text.reset}
          </button>
        </div>
      </fieldset>
    </div>
  );
}
