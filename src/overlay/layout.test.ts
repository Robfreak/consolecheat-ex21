import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { fileURLToPath } from "node:url";

const here = fileURLToPath(new URL(".", import.meta.url));
const css = readFileSync(`${here}styles.css`, "utf8").replace(/\/\*[\s\S]*?\*\//g, "");
const overlay = readFileSync(`${here}Overlay.tsx`, "utf8");
const view = readFileSync(`${here}OverlayView.tsx`, "utf8");

function rule(source: string, selector: string): string {
  const escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const match = new RegExp(`(?:^|\\})\\s*${escaped}\\s*\\{([^}]*)\\}`, "m").exec(source);
  assert.ok(match, `CSS rule ${selector} not found`);
  return match[1];
}

test(".overlay-root is a block box, so no baseline gap under the SVG", () => {
  const body = rule(css, ".overlay-root");
  assert.match(body, /display:\s*block\s*;/);
  assert.doesNotMatch(body, /inline-block|inline-flex|inline-grid/);
  assert.doesNotMatch(body, /vertical-align/);
  assert.match(body, /margin:\s*0\s*;/);
  assert.match(body, /padding:\s*0\s*;/);
});

test("no later rule turns .overlay-root back into an inline-level box", () => {
  const all = [...css.matchAll(/\.overlay-root[^{]*\{([^}]*)\}/g)].map((m) => m[1]).join("\n");
  assert.doesNotMatch(all, /display:\s*inline/);
  assert.doesNotMatch(view, /display:\s*["']?inline|verticalAlign/);
});

test("the overlay SVG is display:block and the root keeps its class", () => {
  assert.match(overlay, /display:\s*"block"/);
  assert.match(view, /className="overlay-root"/);
});
