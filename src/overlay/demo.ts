import { emptyState, type PadState } from "./pad.ts";

// Keyboard demo: turns held keys into a virtual pad state, for testing without a controller.
// Keys are matched by their printed label (event.key), so Z means the key labelled Z on any layout.

export const DEMO_BUTTON_KEYS: Readonly<Record<string, number>> = {
  z: 0,
  x: 1,
  c: 2,
  v: 3,
  q: 4,
  e: 5,
  "1": 6,
  "3": 7,
  n: 8,
  m: 9,
  f: 10,
  h: 11,
  arrowup: 12,
  arrowdown: 13,
  arrowleft: 14,
  arrowright: 15,
  p: 16,
  t: 17,
};

/** Stick keys: axis index and direction. WASD left stick, IJKL right stick. */
export const DEMO_AXIS_KEYS: Readonly<Record<string, [number, -1 | 1]>> = {
  a: [0, -1],
  d: [0, 1],
  w: [1, -1],
  s: [1, 1],
  j: [2, -1],
  l: [2, 1],
  i: [3, -1],
  k: [3, 1],
};

export function demoKey(key: string): string {
  return key.toLowerCase();
}

export function isDemoKey(key: string): boolean {
  const k = demoKey(key);
  return k in DEMO_BUTTON_KEYS || k in DEMO_AXIS_KEYS;
}

/** Virtual pad state for a set of held keys (lowercase `event.key` values). */
export function demoState(held: ReadonlySet<string>): PadState {
  const state = emptyState();
  for (const key of held) {
    const button = DEMO_BUTTON_KEYS[key];
    if (button !== undefined) {
      state.pressed[button] = true;
      state.values[button] = 1;
    }
    const axis = DEMO_AXIS_KEYS[key];
    if (axis) state.axes[axis[0]] = (state.axes[axis[0]] ?? 0) + axis[1];
  }
  state.axes = state.axes.map((v) => Math.max(-1, Math.min(1, v))) as PadState["axes"];
  state.hasTouchpad = true;
  return state;
}
