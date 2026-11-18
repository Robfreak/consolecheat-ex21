import assert from "node:assert/strict";
import test from "node:test";
import { demoKey, demoState, isDemoKey } from "./demo.ts";

const held = (...keys: string[]) => new Set(keys.map(demoKey));

test("demo keys map to the virtual pad's buttons", () => {
  const map: Record<string, number> = { ArrowUp: 12, ArrowDown: 13, ArrowLeft: 14, ArrowRight: 15, z: 0, X: 1, c: 2, v: 3, q: 4, e: 5, "1": 6, "3": 7, f: 10, h: 11, n: 8, m: 9, p: 16, t: 17 };
  for (const [key, button] of Object.entries(map)) {
    const s = demoState(held(key));
    assert.equal(s.pressed[button], true, key);
    assert.equal(s.values[button], 1, key);
    assert.equal(s.pressed.filter(Boolean).length, 1, key);
  }
  assert.equal(demoState(held()).pressed.some(Boolean), false);
});

test("WASD drives the left stick, IJKL the right stick; opposite keys cancel", () => {
  assert.deepEqual(demoState(held("d")).axes, [1, 0, 0, 0]);
  assert.deepEqual(demoState(held("a", "w")).axes, [-1, -1, 0, 0]);
  assert.deepEqual(demoState(held("s")).axes, [0, 1, 0, 0]);
  assert.deepEqual(demoState(held("l", "i")).axes, [0, 0, 1, -1]);
  assert.deepEqual(demoState(held("j", "k")).axes, [0, 0, -1, 1]);
  assert.deepEqual(demoState(held("a", "d")).axes, [0, 0, 0, 0]);
});

test("only demo keys are captured", () => {
  for (const key of ["ArrowUp", "W", "z", "1", "3"]) assert.equal(isDemoKey(key), true, key);
  for (const key of ["2", "Tab", "Enter", "Escape", " ", "b", "y"]) assert.equal(isDemoKey(key), false, key);
});
