// Overlay configuration. Lives only in the URL hash, e.g.
//   #mode=overlay&skin=ps&accent=7eb6ff&base=1b2130&pressed=ff3366&scale=1&pad=auto&dz=0.1&sticks=1&triggers=1&opacity=1
// Parsing never throws: unknown keys are ignored, invalid values fall back to the default, numbers are clamped.

export const SKINS = ["ps", "xbox", "retro"] as const;
export type Skin = (typeof SKINS)[number];
export type PadIndex = "auto" | 0 | 1 | 2 | 3;

export type Config = {
  skin: Skin;
  accent: string;
  base: string;
  pressed: string;
  scale: number;
  pad: PadIndex;
  deadzone: number;
  sticks: boolean;
  triggers: boolean;
  opacity: number;
  demo: boolean;
  hint: boolean;
  lang: "de" | "en";
};

export const DEFAULT_CONFIG: Config = {
  skin: "ps",
  accent: "#7eb6ff",
  base: "#1b2130",
  pressed: "#ff3366",
  scale: 1,
  pad: "auto",
  deadzone: 0.1,
  sticks: true,
  triggers: true,
  opacity: 1,
  demo: false,
  hint: true,
  lang: "de",
};

export const LIMITS = {
  scale: [0.5, 3],
  deadzone: [0, 0.9],
  opacity: [0.1, 1],
} as const;

/** Overlay size at scale 1, in CSS pixels. OBS width/height = this × scale. */
export const BASE_WIDTH = 480;
export const BASE_HEIGHT = 300;

export function overlaySize(config: Pick<Config, "scale">): { width: number; height: number } {
  return { width: Math.round(BASE_WIDTH * config.scale), height: Math.round(BASE_HEIGHT * config.scale) };
}

/** "#abc", "abc", "#aabbcc", or "aabbcc" → "#aabbcc"; anything else → null. */
export function normalizeHex(value: string | null | undefined): string | null {
  if (!value) return null;
  const raw = value.trim().replace(/^#/, "").toLowerCase();
  if (/^[0-9a-f]{6}$/.test(raw)) return `#${raw}`;
  if (/^[0-9a-f]{3}$/.test(raw)) return `#${[...raw].map((c) => c + c).join("")}`;
  return null;
}

export function clampNumber(raw: string | null | undefined, [min, max]: readonly [number, number], fallback: number): number {
  if (raw == null || raw.trim() === "") return fallback;
  const n = Number(raw);
  if (!Number.isFinite(n)) return fallback;
  return Math.min(max, Math.max(min, Math.round(n * 100) / 100));
}

function parseBool(raw: string | null, fallback: boolean): boolean {
  if (raw === null) return fallback;
  const v = raw.trim().toLowerCase();
  if (v === "1" || v === "true" || v === "on" || v === "yes" || v === "") return true;
  if (v === "0" || v === "false" || v === "off" || v === "no") return false;
  return fallback;
}

function parsePad(raw: string | null): PadIndex {
  if (raw === null) return DEFAULT_CONFIG.pad;
  const v = raw.trim().toLowerCase();
  if (v === "auto") return "auto";
  if (/^[0-3]$/.test(v)) return Number(v) as 0 | 1 | 2 | 3;
  return DEFAULT_CONFIG.pad;
}

/** Splits a hash like "#mode=overlay&skin=xbox" into params. Accepts with or without the leading "#". */
export function hashParams(hash: string): URLSearchParams {
  return new URLSearchParams(hash.replace(/^#/, ""));
}

export function parseConfig(params: URLSearchParams): Config {
  const skin = params.get("skin");
  const lang = params.get("lang");
  return {
    skin: (SKINS as readonly string[]).includes(skin ?? "") ? (skin as Skin) : DEFAULT_CONFIG.skin,
    accent: normalizeHex(params.get("accent")) ?? DEFAULT_CONFIG.accent,
    base: normalizeHex(params.get("base")) ?? DEFAULT_CONFIG.base,
    pressed: normalizeHex(params.get("pressed")) ?? DEFAULT_CONFIG.pressed,
    scale: clampNumber(params.get("scale"), LIMITS.scale, DEFAULT_CONFIG.scale),
    pad: parsePad(params.get("pad")),
    deadzone: clampNumber(params.get("dz"), LIMITS.deadzone, DEFAULT_CONFIG.deadzone),
    sticks: parseBool(params.get("sticks"), DEFAULT_CONFIG.sticks),
    triggers: parseBool(params.get("triggers"), DEFAULT_CONFIG.triggers),
    opacity: clampNumber(params.get("opacity"), LIMITS.opacity, DEFAULT_CONFIG.opacity),
    demo: parseBool(params.get("demo"), DEFAULT_CONFIG.demo),
    hint: parseBool(params.get("hint"), DEFAULT_CONFIG.hint),
    lang: lang === "en" ? "en" : "de",
  };
}

export function parseHash(hash: string): Config {
  return parseConfig(hashParams(hash));
}

/** True when the hash or query asks for the overlay view (`#mode=overlay…` or `?overlay`). */
export function isOverlayMode(hash: string, search = ""): boolean {
  if (hashParams(hash).get("mode") === "overlay") return true;
  return new URLSearchParams(search.replace(/^\?/, "")).has("overlay");
}

/** The full hash for the overlay URL. Always lists every value, so the URL is self-explanatory. */
export function serializeConfig(config: Config): string {
  const p = new URLSearchParams();
  p.set("mode", "overlay");
  p.set("skin", config.skin);
  p.set("accent", config.accent.slice(1));
  p.set("base", config.base.slice(1));
  p.set("pressed", config.pressed.slice(1));
  p.set("scale", String(config.scale));
  p.set("pad", String(config.pad));
  p.set("dz", String(config.deadzone));
  p.set("sticks", config.sticks ? "1" : "0");
  p.set("triggers", config.triggers ? "1" : "0");
  p.set("opacity", String(config.opacity));
  if (config.demo) p.set("demo", "1");
  if (!config.hint) p.set("hint", "0");
  p.set("lang", config.lang);
  return p.toString();
}

export function overlayUrl(origin: string, base: string, config: Config): string {
  return `${origin}${base}#${serializeConfig(config)}`;
}
