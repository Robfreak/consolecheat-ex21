import assert from "node:assert/strict";
import test from "node:test";
import { isTypingTarget, shortcutAllowed } from "./input.ts";

test("the keyboard demo is off while any form field has focus", () => {
  assert.equal(isTypingTarget({ tagName: "INPUT", type: "text" }), true);
  assert.equal(isTypingTarget({ tagName: "SELECT" }), true);
  assert.equal(shortcutAllowed({ tagName: "INPUT", type: "text" }), false);
  assert.equal(shortcutAllowed({ tagName: "INPUT", type: "range" }), false);
  assert.equal(shortcutAllowed({ tagName: "INPUT", type: "color" }), false);
  assert.equal(shortcutAllowed({ tagName: "INPUT", type: "checkbox" }), false);
  assert.equal(shortcutAllowed({ tagName: "SELECT" }), false);
  assert.equal(shortcutAllowed({ tagName: "TEXTAREA" }), false);
  assert.equal(shortcutAllowed({ tagName: "DIV", isContentEditable: true }), false);
  assert.equal(shortcutAllowed({ tagName: "BODY" }), true);
  assert.equal(shortcutAllowed({ tagName: "BUTTON" }), true);
  assert.equal(shortcutAllowed(null), true);
});
