import type { PadIndex } from "./config.ts";

// Gamepad reading, normalised into a plain state object. Pure helpers for node:test.
// Standard mapping: 0–3 face, 4 L1, 5 R1, 6 L2, 7 R2, 8 Share, 9 Options, 10 L3, 11 R3,
// 12–15 D-pad up/down/left/right, 16 PS/Home, 17 touchpad (only some pads).

export const BUTTON_COUNT = 18;

export type PadState = {
  /** Pressed state per standard button index (0–17). */
  pressed: boolean[];
  /** Analog value 0..1 per button (triggers use it; digital buttons are 0 or 1). */
  values: number[];
  /** [left x, left y, right x, right y], each -1..1. */
  axes: [number, number, number, number];
  /** Whether the pad reports button 17 (touchpad). */
  hasTouchpad: boolean;
};

export type ButtonLike = { pressed: boolean; value?: number } | undefined;
export type PadLike = { index?: number; connected?: boolean; buttons: readonly ButtonLike[]; axes: readonly number[] };

export function emptyState(): PadState {
  return {
    pressed: Array.from({ length: BUTTON_COUNT }, () => false),
    values: Array.from({ length: BUTTON_COUNT }, () => 0),
    axes: [0, 0, 0, 0],
    hasTouchpad: false,
  };
}

const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));
const finite = (v: unknown) => (typeof v === "number" && Number.isFinite(v) ? v : 0);

/** Trigger (or any button) value in 0..1: the analog value when the pad reports one, else 1/0 from pressed. */
export function triggerValue(button: ButtonLike): number {
  if (!button) return 0;
  if (typeof button.value === "number" && Number.isFinite(button.value)) {
    const v = clamp(button.value, 0, 1);
    return button.pressed && v === 0 ? 1 : v;
  }
  return button.pressed ? 1 : 0;
}

/**
 * Radial deadzone with rescaling. Inside the deadzone the stick reads as centred;
 * outside, the distance is rescaled so the edge of the deadzone maps to 0 and full tilt to 1.
 * Magnitudes above 1 (square gates, diagonals) are clamped to the unit circle.
 */
export function applyDeadzone(x: number, y: number, deadzone: number): [number, number] {
  const fx = finite(x);
  const fy = finite(y);
  const m = Math.hypot(fx, fy);
  const dz = clamp(finite(deadzone), 0, 0.99);
  if (m <= dz || m === 0) return [0, 0];
  const scaled = Math.min(1, (m - dz) / (1 - dz));
  return [(fx / m) * scaled, (fy / m) * scaled];
}

export function readPad(pad: PadLike): PadState {
  const state = emptyState();
  for (let i = 0; i < BUTTON_COUNT; i++) {
    const button = pad.buttons[i];
    const value = triggerValue(button);
    state.values[i] = value;
    state.pressed[i] = Boolean(button?.pressed) || value > 0.5;
  }
  state.axes = [0, 1, 2, 3].map((i) => clamp(finite(pad.axes[i]), -1, 1)) as PadState["axes"];
  state.hasTouchpad = pad.buttons.length > 17;
  return state;
}

/** "auto": the first connected pad. A number: that slot, or null when it is empty or disconnected. */
export function selectPad<T extends PadLike>(pads: readonly (T | null)[] | null | undefined, index: PadIndex): T | null {
  if (!pads) return null;
  const live = (pad: T | null | undefined): pad is T => Boolean(pad) && pad?.connected !== false;
  if (index === "auto") {
    for (const pad of pads) if (live(pad)) return pad;
    return null;
  }
  const pad = pads[index];
  return live(pad) ? pad : null;
}

/** Combines the real pad and the keyboard demo: a button is pressed if either presses it. */
export function mergeStates(a: PadState | null, b: PadState | null): PadState | null {
  if (!a) return b;
  if (!b) return a;
  const out = emptyState();
  for (let i = 0; i < BUTTON_COUNT; i++) {
    out.pressed[i] = Boolean(a.pressed[i] || b.pressed[i]);
    out.values[i] = Math.max(a.values[i] ?? 0, b.values[i] ?? 0);
  }
  out.axes = a.axes.map((v, i) => (Math.abs(b.axes[i] ?? 0) > Math.abs(v) ? (b.axes[i] ?? 0) : v)) as PadState["axes"];
  out.hasTouchpad = a.hasTouchpad || b.hasTouchpad;
  return out;
}

export function sameState(a: PadState | null, b: PadState | null): boolean {
  if (a === b) return true;
  if (!a || !b) return false;
  return (
    a.hasTouchpad === b.hasTouchpad &&
    a.axes.every((v, i) => Math.abs(v - (b.axes[i] ?? 0)) < 0.002) &&
    a.values.every((v, i) => Math.abs(v - (b.values[i] ?? 0)) < 0.002) &&
    a.pressed.every((v, i) => v === b.pressed[i])
  );
}
