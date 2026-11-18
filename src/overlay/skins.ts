import type { Skin } from "./config.ts";

// Button labels per skin, by standard-mapping index.

export type SkinDef = {
  id: Skin;
  de: string;
  en: string;
  /** Labels for buttons 0–17. */
  labels: readonly string[];
  /** Label colours of the four face buttons (0–3); null uses the accent colour. */
  faceColors: readonly (string | null)[];
  /** Corner radius factor for face buttons: 1 = round, small = square pixel look. */
  round: number;
  /** Whether this skin draws the touchpad (only shown when the pad reports button 17). */
  touchpad: boolean;
};

export const SKIN_DEFS: Readonly<Record<Skin, SkinDef>> = {
  ps: {
    id: "ps",
    de: "PlayStation",
    en: "PlayStation",
    labels: ["×", "○", "□", "△", "L1", "R1", "L2", "R2", "Share", "Options", "L3", "R3", "↑", "↓", "←", "→", "PS", "Touchpad"],
    faceColors: ["#7cb2e8", "#ff6b6b", "#e58cd8", "#3fd6a5"],
    round: 1,
    touchpad: true,
  },
  xbox: {
    id: "xbox",
    de: "Xbox",
    en: "Xbox",
    labels: ["A", "B", "X", "Y", "LB", "RB", "LT", "RT", "View", "Menu", "LS", "RS", "↑", "↓", "←", "→", "Home", "Share"],
    faceColors: ["#5ec44e", "#e8463c", "#3b8be8", "#f2c230"],
    round: 1,
    touchpad: false,
  },
  retro: {
    id: "retro",
    de: "Minimal/Retro",
    en: "Minimal/Retro",
    labels: ["B", "A", "Y", "X", "L", "R", "ZL", "ZR", "Select", "Start", "L3", "R3", "↑", "↓", "←", "→", "Home", "Pad"],
    faceColors: [null, null, null, null],
    round: 0.15,
    touchpad: false,
  },
};

export function buttonLabel(skin: Skin, index: number): string {
  return SKIN_DEFS[skin].labels[index] ?? String(index);
}
