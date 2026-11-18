import assert from "node:assert/strict";
import test from "node:test";
import { DEFAULT_CONFIG } from "./config.ts";
import { CONFIG_KEY, LANG_KEY, THEME_KEY, loadConfig, parseStored, resetConfig, saveConfig, type StorageLike } from "./storage.ts";

function memory(initial: Record<string, string> = {}): StorageLike & { data: Map<string, string> } {
  const data = new Map(Object.entries(initial));
  return { data, getItem: (k) => data.get(k) ?? null, setItem: (k, v) => void data.set(k, v), removeItem: (k) => void data.delete(k) };
}

test("the last config round-trips under consolecheat-overlay-v1 with schema and version", () => {
  assert.equal(CONFIG_KEY, "consolecheat-overlay-v1");
  const store = memory();
  const config = { ...DEFAULT_CONFIG, skin: "xbox" as const, scale: 2 };
  assert.equal(saveConfig(store, config), true);
  const raw = JSON.parse(store.data.get(CONFIG_KEY) ?? "{}");
  assert.equal(raw.schema, "consolecheat-overlay");
  assert.equal(raw.version, 1);
  assert.deepEqual(loadConfig(store), { config, corrupt: false });
});

test("missing gives null; corrupt, foreign, or other-version data is flagged and ignored", () => {
  assert.deepEqual(parseStored(null), { config: null, corrupt: false });
  for (const raw of ["{nope", "[]", "1", '{"schema":"x","version":1,"hash":""}', '{"schema":"consolecheat-overlay","version":2,"hash":""}', '{"schema":"consolecheat-overlay","version":1,"hash":5}']) {
    assert.deepEqual(parseStored(raw), { config: null, corrupt: true }, raw);
  }
  const clamped = parseStored('{"schema":"consolecheat-overlay","version":1,"hash":"scale=50&accent=nope"}');
  assert.equal(clamped.config?.scale, 3);
  assert.equal(clamped.config?.accent, DEFAULT_CONFIG.accent);
  const throwing: StorageLike = {
    getItem() {
      throw new Error("blocked");
    },
    setItem() {
      throw new Error("full");
    },
    removeItem() {
      throw new Error("blocked");
    },
  };
  assert.deepEqual(loadConfig(throwing), { config: null, corrupt: false });
  assert.equal(saveConfig(throwing, DEFAULT_CONFIG), false);
  assert.equal(resetConfig(throwing), false);
});

test("reset removes only consolecheat-overlay-v1", () => {
  const store = memory({ [CONFIG_KEY]: "{}", [LANG_KEY]: "en", [THEME_KEY]: "dark", "consolecheat-banner-v1": "{}" });
  assert.equal(resetConfig(store), true);
  assert.deepEqual([...store.data.keys()].sort(), ["consolecheat-banner-v1", "consolecheat-lang", "consolecheat-theme"]);
});
