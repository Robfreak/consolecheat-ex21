import { DEFAULT_CONFIG, parseHash, serializeConfig, type Config } from "./config.ts";

// What this page stores (config mode only; the overlay view never reads or writes storage).
//
// localStorage key `consolecheat-overlay-v1`:
//   { "schema": "consolecheat-overlay", "version": 1, "hash": "mode=overlay&skin=ps&…" }
// The saved hash is parsed with the same robust parser as the URL.

export const CONFIG_KEY = "consolecheat-overlay-v1";
export const LANG_KEY = "consolecheat-lang";
export const THEME_KEY = "consolecheat-theme";
export const CONFIG_SCHEMA = "consolecheat-overlay";
export const CONFIG_VERSION = 1;

export type StorageLike = Pick<Storage, "getItem" | "setItem" | "removeItem">;
export type LoadResult = { config: Config | null; corrupt: boolean };

/** Never throws. Missing key: null. Bad JSON, foreign schema, other version: null and corrupt. */
export function parseStored(raw: string | null): LoadResult {
  if (raw == null) return { config: null, corrupt: false };
  try {
    const data: unknown = JSON.parse(raw);
    if (!data || typeof data !== "object" || Array.isArray(data)) return { config: null, corrupt: true };
    const rec = data as Record<string, unknown>;
    if (rec.schema !== CONFIG_SCHEMA || rec.version !== CONFIG_VERSION || typeof rec.hash !== "string" || rec.hash.length > 2000) {
      return { config: null, corrupt: true };
    }
    return { config: parseHash(rec.hash), corrupt: false };
  } catch {
    return { config: null, corrupt: true };
  }
}

export function serializeStored(config: Config): string {
  return JSON.stringify({ schema: CONFIG_SCHEMA, version: CONFIG_VERSION, hash: serializeConfig(config) });
}

export function loadConfig(local: StorageLike): LoadResult {
  try {
    return parseStored(local.getItem(CONFIG_KEY));
  } catch {
    return { config: null, corrupt: false };
  }
}

export function saveConfig(local: StorageLike, config: Config): boolean {
  try {
    local.setItem(CONFIG_KEY, serializeStored(config));
    return true;
  } catch {
    return false;
  }
}

/** Removes only `consolecheat-overlay-v1`. Language, theme, and every other key stay. */
export function resetConfig(local: StorageLike): boolean {
  try {
    local.removeItem(CONFIG_KEY);
    return true;
  } catch {
    return false;
  }
}

export const defaultConfig = (): Config => ({ ...DEFAULT_CONFIG });
