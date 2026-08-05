/**
 * Sleep/resume correction.
 *
 * When the machine wakes from sleep, the WebView window receives a `focus`
 * event and the document fires a `visibilitychange` to `visible`. This module
 * hooks those browser-level events (which fire reliably on Windows, macOS and
 * Linux) and forces the shared scheduler to re-read the real clock
 * immediately — so clocks correct the instant the machine wakes, without
 * waiting for the next minute/second boundary.
 *
 * (A native `WindowEvent::Resumed` is mobile-only in Tauri and unsupported on
 * Windows, so the browser events are the correct cross-platform signal.)
 */

import { getSharedScheduler } from "./scheduler";

let wired = false;
let focusHandler: (() => void) | null = null;
let visibilityHandler: (() => void) | null = null;

/** Subscribe the shared scheduler to wake-from-sleep signals (idempotent). */
export function wireResumeHandling(): void {
  if (wired) return;
  wired = true;

  const sync = () => getSharedScheduler().syncNow();
  focusHandler = sync;

  // The window regains focus when the desktop session returns.
  window.addEventListener("focus", focusHandler);
  // The document becomes visible again when the display resumes.
  visibilityHandler = () => {
    if (document.visibilityState === "visible") sync();
  };
  document.addEventListener("visibilitychange", visibilityHandler);
}

/** Test helper — removes listeners and resets wiring state. */
export function resetResumeWiringForTests(): void {
  if (focusHandler) window.removeEventListener("focus", focusHandler);
  if (visibilityHandler) {
    document.removeEventListener("visibilitychange", visibilityHandler);
  }
  focusHandler = null;
  visibilityHandler = null;
  wired = false;
}
