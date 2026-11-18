import assert from "node:assert/strict";
import test from "node:test";
import { SKINS } from "./config.ts";
import { SKIN_DEFS, buttonLabel } from "./skins.ts";

test("at least three skins, each labelling all 18 standard buttons", () => {
  assert.ok(SKINS.length >= 3);
  assert.deepEqual(SKINS.map((s) => SKIN_DEFS[s].de), ["PlayStation", "Xbox", "Minimal/Retro"]);
  for (const skin of SKINS) {
    const def = SKIN_DEFS[skin];
    assert.equal(def.labels.length, 18, skin);
    assert.equal(new Set(def.labels).size, 18, `${skin} labels are unique`);
    assert.equal(def.faceColors.length, 4);
  }
});

test("button mapping per skin follows the standard gamepad layout", () => {
  const expect: Record<string, Record<number, string>> = {
    ps: { 0: "×", 1: "○", 2: "□", 3: "△", 4: "L1", 5: "R1", 6: "L2", 7: "R2", 8: "Share", 9: "Options", 10: "L3", 11: "R3", 16: "PS", 17: "Touchpad" },
    xbox: { 0: "A", 1: "B", 2: "X", 3: "Y", 4: "LB", 5: "RB", 6: "LT", 7: "RT", 8: "View", 9: "Menu", 10: "LS", 11: "RS", 16: "Home" },
    retro: { 0: "B", 1: "A", 2: "Y", 3: "X", 4: "L", 5: "R", 6: "ZL", 7: "ZR", 8: "Select", 9: "Start", 16: "Home" },
  };
  for (const [skin, map] of Object.entries(expect)) {
    for (const [i, label] of Object.entries(map)) assert.equal(buttonLabel(skin as "ps", Number(i)), label, `${skin} ${i}`);
    assert.deepEqual([12, 13, 14, 15].map((i) => buttonLabel(skin as "ps", i)), ["↑", "↓", "←", "→"]);
  }
  assert.equal(SKIN_DEFS.ps.touchpad, true);
  assert.equal(SKIN_DEFS.xbox.touchpad, false);
  assert.ok(SKIN_DEFS.retro.round < SKIN_DEFS.ps.round, "retro face buttons are square-ish");
});
