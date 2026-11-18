import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { copy, fill, initialLang, languageOptions } from "./messages.ts";
import { CONFIG_KEY } from "./storage.ts";

function leaves(value: unknown, prefix = ""): string[] {
  if (value && typeof value === "object") {
    return Object.entries(value).flatMap(([key, inner]) => leaves(inner, prefix ? `${prefix}.${key}` : key));
  }
  return [prefix];
}

test("German is the default and English has the same keys and placeholders", () => {
  assert.equal(languageOptions[0]?.id, "de");
  assert.equal(initialLang(null), "de");
  assert.equal(initialLang("xx"), "de");
  assert.equal(initialLang("en"), "en");
  assert.deepEqual(leaves(copy.de).sort(), leaves(copy.en).sort());
  for (const key of leaves(copy.de)) {
    const de = (copy.de as Record<string, unknown>)[key];
    const en = (copy.en as Record<string, unknown>)[key];
    assert.equal(typeof de, "string", key);
    assert.ok(String(de).trim() && String(en).trim(), key);
    const holes = (s: unknown) => (String(s).match(/\{[A-Za-z0-9]+\}/g) ?? []).sort();
    assert.deepEqual(holes(de), holes(en), key);
  }
});

test("copy has the pad hint, OBS steps, demo keys, and names the storage key", () => {
  assert.equal(copy.de.hintPress, "Drücke eine Taste am Controller");
  assert.equal(copy.de.copy, "Link kopieren");
  assert.equal(copy.de.open, "Overlay öffnen");
  assert.equal(copy.de.toolsHeading, "Weitere Werkzeuge");
  assert.match(copy.de.obs4, /CSS/);
  assert.equal(fill(copy.de.obs3, { w: 480, h: 300 }), "Breite 480 und Höhe 300 eintragen (passend zur gewählten Größe).");
  for (const key of ["Pfeiltasten", "WASD", "IJKL", "Z/X/C/V", "Q/E", "1/3", "demo=1"]) assert.ok(copy.de.controls.includes(key), key);
  assert.match(copy.de.storageNote, new RegExp(CONFIG_KEY));
  assert.match(copy.de.deleteAsk, new RegExp(CONFIG_KEY));
  assert.match(copy.en.deleteAsk, new RegExp(CONFIG_KEY));
});

test("the UI wires labels, aria-live, rAF polling, the clipboard fallback, and transparent overlay CSS", () => {
  const ui = readFileSync(new URL("./ConfigPage.tsx", import.meta.url), "utf8");
  const live = readFileSync(new URL("./live.ts", import.meta.url), "utf8");
  const view = readFileSync(new URL("./OverlayView.tsx", import.meta.url), "utf8");
  const styles = readFileSync(new URL("./styles.css", import.meta.url), "utf8");
  const html = readFileSync(new URL("../../index.html", import.meta.url), "utf8");
  assert.match(ui, /aria-live="polite"/);
  assert.match(ui, /htmlFor="ov-url"/);
  assert.match(ui, /navigator\.clipboard\.writeText/);
  assert.match(ui, /\.select\(\)/);
  assert.match(ui, /className="checker/);
  assert.match(live, /requestAnimationFrame\(poll\)/);
  assert.match(live, /navigator\.getGamepads\(\)/);
  assert.match(live, /shortcutAllowed\(event\.target/);
  assert.doesNotMatch(view, /SiteFooter|SiteHeader|localStorage/);
  assert.doesNotMatch(`${ui}${live}${view}`, /fetch\(|XMLHttpRequest|sendBeacon/);
  assert.match(styles, /html\[data-mode="overlay"\] body \{\s*background: transparent !important;/);
  assert.match(html, /dataset\.mode = overlay \? "overlay" : "config"/);
  assert.match(styles, /prefers-reduced-motion/);
  assert.match(styles, /390px/);
  assert.match(styles, /:focus-visible/);
});
