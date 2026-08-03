import { describe, expect, it, vi } from "vitest";
import { TimeScheduler } from "../scheduler";

describe("TimeScheduler", () => {
  it("reports the initial instant", () => {
    const s = new TimeScheduler(1_700_000_000_000);
    expect(s.current).toBe(1_700_000_000_000);
  });

  it("syncNow emits to subscribers with the corrected clock", () => {
    const s = new TimeScheduler(1_000);
    const fn = vi.fn();
    s.subscribe(fn, { wantsSeconds: false });
    s.syncNow(); // Date.now() is real here
    expect(fn).toHaveBeenCalledTimes(1);
    expect(fn.mock.calls[0][0]).toBeGreaterThanOrEqual(1_000_000_000_000);
  });

  it("unsubscribe empties subscribers without throwing", () => {
    const s = new TimeScheduler();
    const un = s.subscribe(() => {}, { wantsSeconds: true });
    un();
    s.dispose();
  });

  it("dispose cancels timers", () => {
    const s = new TimeScheduler();
    const un = s.subscribe(() => {}, { wantsSeconds: true });
    s.dispose();
    un();
  });
});
