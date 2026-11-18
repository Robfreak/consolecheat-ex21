// Focus rules for the keyboard demo. Pure helpers so node:test can check them.

export type TargetLike = {
  tagName?: string;
  type?: string;
  isContentEditable?: boolean;
} | null;

const TEXT_INPUTS = new Set(["text", "search", "email", "url", "tel", "password", "number"]);

/** Text fields, text areas, and selects keep every key: no shortcut fires while they have focus. */
export function isTypingTarget(target: TargetLike): boolean {
  if (!target) return false;
  if (target.isContentEditable) return true;
  const tag = (target.tagName ?? "").toUpperCase();
  if (tag === "TEXTAREA" || tag === "SELECT") return true;
  if (tag === "INPUT") return TEXT_INPUTS.has((target.type ?? "text").toLowerCase());
  return false;
}

/**
 * The keyboard demo stays off while any form field has focus: text fields, selects,
 * and also sliders, colour pickers, and checkboxes, which use the arrow keys themselves.
 */
export function shortcutAllowed(target: TargetLike): boolean {
  if (isTypingTarget(target)) return false;
  const tag = (target?.tagName ?? "").toUpperCase();
  return tag !== "INPUT";
}
