import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { getSharedScheduler, resetSharedSchedulerForTests } from "../scheduler";
import { resetResumeWiringForTests, wireResumeHandling } from "../resume";

describe("wireResumeHandling", () => {
  beforeEach(() => {
    resetSharedSchedulerForTests();
    resetResumeWiringForTests();
  });
  afterEach(() => {
    resetSharedSchedulerForTests();
    resetResumeWiringForTests();
  });

  it("registers a focus listener that syncs the scheduler", () => {
    const addSpy = vi.spyOn(window, "addEventListener");
    wireResumeHandling();
    expect(addSpy).toHaveBeenCalledWith("focus", expect.any(Function));
  });

  it("registers a visibilitychange listener", () => {
    const addSpy = vi.spyOn(document, "addEventListener");
    wireResumeHandling();
    expect(addSpy).toHaveBeenCalledWith(
      "visibilitychange",
      expect.any(Function),
    );
  });

  it("is idempotent — wiring twice registers listeners once", () => {
    const addSpy = vi.spyOn(window, "addEventListener");
    wireResumeHandling();
    wireResumeHandling();
    const focusCalls = addSpy.mock.calls.filter(([e]) => e === "focus").length;
    expect(focusCalls).toBe(1);
  });

  it("syncNow emits to scheduler subscribers with the corrected clock", () => {
    wireResumeHandling();
    const scheduler = getSharedScheduler();
    const fn = vi.fn();
    scheduler.subscribe(fn, { wantsSeconds: false });

    // Dispatch the focus event the wiring listens for.
    window.dispatchEvent(new Event("focus"));
    expect(fn).toHaveBeenCalledTimes(1);
    // The value reflects a real (post-wake) clock instant.
    expect(fn.mock.calls[0][0]).toBeGreaterThanOrEqual(1_000_000_000_000);
  });
});
