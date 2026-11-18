import assert from "node:assert/strict";
import test from "node:test";
import { applyDeadzone, emptyState, mergeStates, readPad, sameState, selectPad, triggerValue, type PadLike } from "./pad.ts";

const near = (a: number, b: number, eps = 1e-9) => assert.ok(Math.abs(a - b) < eps, `${a} ≈ ${b}`);

test("radial deadzone: inside is centred, outside is rescaled from 0 to 1", () => {
  assert.deepEqual(applyDeadzone(0.05, 0.05, 0.1), [0, 0]);
  assert.deepEqual(applyDeadzone(0.1, 0, 0.1), [0, 0]);
  const [x] = applyDeadzone(0.55, 0, 0.1);
  near(x, 0.5);
  const [fx, fy] = applyDeadzone(1, 0, 0.1);
  near(fx, 1);
  near(fy, 0);
  // Radial, not per axis: (0.08, 0.08) has magnitude 0.113 > 0.1, so it is outside.
  const [dx, dy] = applyDeadzone(0.08, 0.08, 0.1);
  assert.ok(dx > 0 && dy > 0);
  near(dx, dy);
  // Diagonal beyond the unit circle is clamped to magnitude 1, direction kept.
  const [cx, cy] = applyDeadzone(1, 1, 0.1);
  near(Math.hypot(cx, cy), 1);
  near(cx, cy);
  assert.deepEqual(applyDeadzone(0.3, -0.4, 0), [0.3, -0.4]);
  assert.deepEqual(applyDeadzone(Number.NaN, 0.5, 0.6), [0, 0]);
});

test("trigger values map to 0..1", () => {
  assert.equal(triggerValue(undefined), 0);
  assert.equal(triggerValue({ pressed: false, value: 0 }), 0);
  assert.equal(triggerValue({ pressed: false, value: 0.42 }), 0.42);
  assert.equal(triggerValue({ pressed: true, value: 1 }), 1);
  assert.equal(triggerValue({ pressed: true, value: 1.7 }), 1);
  assert.equal(triggerValue({ pressed: false, value: -0.2 }), 0);
  assert.equal(triggerValue({ pressed: true }), 1, "digital trigger without value");
  assert.equal(triggerValue({ pressed: true, value: 0 }), 1, "pressed but value 0 shows full");
});

function pad(pressed: number[], extra: Partial<PadLike> & { values?: Record<number, number>; length?: number } = {}): PadLike {
  const length = extra.length ?? 18;
  return {
    index: extra.index ?? 0,
    connected: extra.connected ?? true,
    buttons: Array.from({ length }, (_, i) => ({ pressed: pressed.includes(i), value: extra.values?.[i] ?? (pressed.includes(i) ? 1 : 0) })),
    axes: extra.axes ?? [0, 0, 0, 0],
  };
}

test("readPad normalises buttons, analog triggers, axes, and touchpad presence", () => {
  const s = readPad(pad([0, 12, 16], { values: { 6: 0.25, 7: 0.75 }, axes: [0.5, -2, 0, 0.1] }));
  assert.equal(s.pressed[0], true);
  assert.equal(s.pressed[12], true);
  assert.equal(s.pressed[16], true);
  assert.equal(s.values[6], 0.25);
  assert.equal(s.pressed[6], false);
  assert.equal(s.values[7], 0.75);
  assert.equal(s.pressed[7], true, "trigger past half counts as pressed");
  assert.deepEqual(s.axes, [0.5, -1, 0, 0.1]);
  assert.equal(s.hasTouchpad, true);
  assert.equal(readPad(pad([], { length: 17 })).hasTouchpad, false);
  assert.equal(readPad({ buttons: [], axes: [] }).pressed.length, 18);
});

test("pad selection: auto takes the first connected pad, a number takes that slot", () => {
  const a = pad([], { index: 1 });
  const b = pad([], { index: 2 });
  const off = pad([], { index: 0, connected: false });
  assert.equal(selectPad([null, a, b, null], "auto"), a);
  assert.equal(selectPad([off, null, b], "auto"), b);
  assert.equal(selectPad([null, a, b], 2), b);
  assert.equal(selectPad([null, a, b], 0), null);
  assert.equal(selectPad([off], 0), null);
  assert.equal(selectPad([null, a], 3), null);
  assert.equal(selectPad(null, "auto"), null);
  assert.equal(selectPad([], "auto"), null);
});

test("pad and keyboard demo merge; sameState spots changes", () => {
  const real = emptyState();
  real.pressed[0] = true;
  real.values[0] = 1;
  real.axes[0] = 0.3;
  const demo = emptyState();
  demo.pressed[5] = true;
  demo.values[5] = 1;
  demo.axes[0] = -1;
  const m = mergeStates(real, demo);
  assert.equal(m?.pressed[0], true);
  assert.equal(m?.pressed[5], true);
  assert.equal(m?.axes[0], -1);
  assert.equal(mergeStates(null, demo), demo);
  assert.equal(mergeStates(real, null), real);
  assert.equal(sameState(real, structuredClone(real)), true);
  assert.equal(sameState(real, demo), false);
  assert.equal(sameState(null, null), true);
});
