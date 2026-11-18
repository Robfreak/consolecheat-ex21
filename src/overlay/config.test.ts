import assert from "node:assert/strict";
import test from "node:test";
import {
  DEFAULT_CONFIG,
  isOverlayMode,
  normalizeHex,
  overlaySize,
  overlayUrl,
  parseHash,
  serializeConfig,
  type Config,
} from "./config.ts";

test("an empty or unknown hash gives the defaults", () => {
  assert.deepEqual(parseHash(""), DEFAULT_CONFIG);
  assert.deepEqual(parseHash("#"), DEFAULT_CONFIG);
  assert.deepEqual(parseHash("#foo=bar&mode=overlay"), DEFAULT_CONFIG);
  assert.deepEqual(parseHash("#impressum"), DEFAULT_CONFIG);
});

test("serialize and parse round-trip every field", () => {
  const configs: Config[] = [
    DEFAULT_CONFIG,
    { skin: "xbox", accent: "#00ff00", base: "#000000", pressed: "#ffffff", scale: 2.25, pad: 2, deadzone: 0.35, sticks: false, triggers: false, opacity: 0.5, demo: true, hint: false, lang: "en" },
    { ...DEFAULT_CONFIG, skin: "retro", pad: 0, scale: 0.5, deadzone: 0, opacity: 0.1 },
  ];
  for (const config of configs) {
    const hash = serializeConfig(config);
    assert.match(hash, /^mode=overlay&/);
    assert.deepEqual(parseHash(`#${hash}`), config, hash);
  }
});

test("numbers are clamped, invalid values fall back to defaults", () => {
  const c = parseHash("#scale=99&dz=-1&opacity=0&pad=7&skin=nintendo&sticks=maybe&lang=fr");
  assert.equal(c.scale, 3);
  assert.equal(c.deadzone, 0);
  assert.equal(c.opacity, 0.1);
  assert.equal(c.pad, "auto");
  assert.equal(c.skin, "ps");
  assert.equal(c.sticks, true);
  assert.equal(c.lang, "de");
  const d = parseHash("#scale=abc&dz=NaN&opacity=&pad=-1");
  assert.equal(d.scale, 1);
  assert.equal(d.deadzone, 0.1);
  assert.equal(d.opacity, 1);
  assert.equal(d.pad, "auto");
  assert.equal(parseHash("#scale=1.234").scale, 1.23);
  assert.equal(parseHash("#sticks=0&triggers=false&demo=1&hint=off").sticks, false);
  assert.equal(parseHash("#triggers=false").triggers, false);
  assert.equal(parseHash("#demo=1").demo, true);
  assert.equal(parseHash("#hint=off").hint, false);
});

test("hex colours are validated and normalised", () => {
  assert.equal(normalizeHex("ff3366"), "#ff3366");
  assert.equal(normalizeHex("#FF3366"), "#ff3366");
  assert.equal(normalizeHex("f36"), "#ff3366");
  assert.equal(normalizeHex("#f36"), "#ff3366");
  for (const bad of ["", "red", "#12345", "1234567", "gg0000", "#ff336", "javascript:alert(1)"]) assert.equal(normalizeHex(bad), null, bad);
  const c = parseHash("#accent=zzz&base=12&pressed=%23ABCDEF");
  assert.equal(c.accent, DEFAULT_CONFIG.accent);
  assert.equal(c.base, DEFAULT_CONFIG.base);
  assert.equal(c.pressed, "#abcdef");
});

test("overlay mode comes from the hash or ?overlay; the URL and OBS size follow the config", () => {
  assert.equal(isOverlayMode("#mode=overlay"), true);
  assert.equal(isOverlayMode("#skin=xbox&mode=overlay"), true);
  assert.equal(isOverlayMode("", "?overlay"), true);
  assert.equal(isOverlayMode("#skin=xbox"), false);
  assert.equal(isOverlayMode("#datenschutz"), false);
  assert.equal(isOverlayMode("#mode=config"), false);
  const url = overlayUrl("https://robfreak.github.io", "/consolecheat-ex21/", DEFAULT_CONFIG);
  assert.equal(
    url,
    "https://robfreak.github.io/consolecheat-ex21/#mode=overlay&skin=ps&accent=7eb6ff&base=1b2130&pressed=ff3366&scale=1&pad=auto&dz=0.1&sticks=1&triggers=1&opacity=1&lang=de",
  );
  assert.deepEqual(overlaySize({ scale: 1 }), { width: 480, height: 300 });
  assert.deepEqual(overlaySize({ scale: 1.5 }), { width: 720, height: 450 });
});
