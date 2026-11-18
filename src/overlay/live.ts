import { useEffect, useRef, useState } from "react";
import type { PadIndex } from "./config.ts";
import { demoKey, demoState, isDemoKey } from "./demo.ts";
import { shortcutAllowed } from "./input.ts";
import { mergeStates, readPad, sameState, selectPad, type PadState } from "./pad.ts";

export type Live = { state: PadState | null; connected: boolean; padId: string };

/**
 * Polls the Gamepad API once per animation frame and merges the keyboard demo.
 * Display only: it shows the current state, so there is no first-poll rule. No pad button triggers an action.
 */
export function useLivePad(pad: PadIndex, demo: boolean): Live {
  const [live, setLive] = useState<Live>({ state: null, connected: false, padId: "" });
  const held = useRef(new Set<string>());
  const demoRef = useRef(demo);
  demoRef.current = demo;

  useEffect(() => {
    if (!demo) held.current.clear();
  }, [demo]);

  useEffect(() => {
    const down = (event: KeyboardEvent) => {
      if (!demoRef.current || event.ctrlKey || event.metaKey || event.altKey) return;
      if (!isDemoKey(event.key) || !shortcutAllowed(event.target as HTMLElement | null)) return;
      event.preventDefault();
      held.current.add(demoKey(event.key));
    };
    const up = (event: KeyboardEvent) => {
      held.current.delete(demoKey(event.key));
    };
    const clear = () => held.current.clear();
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    window.addEventListener("blur", clear);
    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
      window.removeEventListener("blur", clear);
    };
  }, []);

  useEffect(() => {
    let frame = 0;
    let last: Live = { state: null, connected: false, padId: "" };
    const poll = () => {
      const pads = typeof navigator !== "undefined" && "getGamepads" in navigator ? navigator.getGamepads() : null;
      const found = selectPad(pads ? [...pads] : null, pad);
      const real = found ? readPad(found) : null;
      const virtual = demoRef.current ? demoState(held.current) : null;
      const state = mergeStates(real, virtual);
      const next: Live = { state, connected: Boolean(found), padId: found?.id ?? "" };
      if (next.connected !== last.connected || next.padId !== last.padId || !sameState(next.state, last.state)) {
        last = next;
        setLive(next);
      }
      frame = requestAnimationFrame(poll);
    };
    frame = requestAnimationFrame(poll);
    return () => cancelAnimationFrame(frame);
  }, [pad]);

  return live;
}
