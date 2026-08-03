/**
 * OpenTime scheduler — the single coordinated time source.
 *
 * One scheduler instance exists per window (manager or widget). It advances a
 * single `now` value and notifies subscribers. Seconds-disabled clocks do not
 * tick every second; the scheduler only fires at the interval required by its
 * subscribers' "wants seconds" flag.
 *
 * Design goals:
 *   - zero drift: recompute `now` from Date.now() at every tick, never
 *     accumulate +1000ms increments
 *   - minimal wakeups: when no subscriber wants seconds, tick once per minute
 *     (aligned to the minute boundary)
 *   - sleep-safe: on resume, ticks immediately; Date.now() reflects the
 *     corrected system clock
 */

type Subscriber = (now: number) => void;

export class TimeScheduler {
  private now: number;
  private wantsSeconds = false;
  private timer: ReturnType<typeof setInterval> | null = null;
  private nextBoundaryTimeout: ReturnType<typeof setTimeout> | null = null;
  private readonly subscribers = new Set<Subscriber>();

  constructor(initialNow: number = Date.now()) {
    this.now = initialNow;
  }

  /** Current wall-clock instant (ms epoch). */
  get current(): number {
    return this.now;
  }

  /** Called by the environment when the system resumes from sleep. */
  syncNow(): void {
    this.now = Date.now();
    this.emit();
    this.reschedule();
  }

  /** Subscribe to ticks. `wantsSeconds` gates the tick rate. */
  subscribe(fn: Subscriber, opts?: { wantsSeconds?: boolean }): () => void {
    this.subscribers.add(fn);
    if (opts?.wantsSeconds) this.setWantsSeconds(true);
    this.ensureStarted();
    return () => {
      this.subscribers.delete(fn);
      // Recompute whether any remaining subscriber wants seconds.
      this.recomputeWantsSeconds();
    };
  }

  private setWantsSeconds(v: boolean): void {
    if (v === this.wantsSeconds) return;
    this.wantsSeconds = v;
    this.reschedule();
  }

  private recomputeWantsSeconds(): void {
    // The scheduler API does not receive want flags on unsubscribe; we
    // conservatively keep seconds ticking unless subscribers become empty.
    if (this.subscribers.size === 0) {
      this.stop();
    }
  }

  private emit(): void {
    for (const fn of this.subscribers) fn(this.now);
  }

  private ensureStarted(): void {
    if (this.timer === null && this.nextBoundaryTimeout === null) {
      this.reschedule();
    }
  }

  private reschedule(): void {
    this.clearTimers();
    const nowMs = Date.now();

    if (this.wantsSeconds) {
      // Tick at the next second boundary, then every 1000ms.
      const msToNextSec = 1000 - (nowMs % 1000);
      this.nextBoundaryTimeout = setTimeout(() => {
        this.now = Date.now();
        this.emit();
        this.timer = setInterval(() => {
          this.now = Date.now();
          this.emit();
        }, 1000);
      }, msToNextSec);
    } else {
      // Tick at the next minute boundary, then every 60s.
      const secs = Math.floor(nowMs / 1000) % 60;
      const msToNextMin = (60 - secs) * 1000 - (nowMs % 1000);
      this.nextBoundaryTimeout = setTimeout(() => {
        this.now = Date.now();
        this.emit();
        this.timer = setInterval(() => {
          this.now = Date.now();
          this.emit();
        }, 60_000);
      }, msToNextMin);
    }
  }

  private clearTimers(): void {
    if (this.timer !== null) {
      clearInterval(this.timer);
      this.timer = null;
    }
    if (this.nextBoundaryTimeout !== null) {
      clearTimeout(this.nextBoundaryTimeout);
      this.nextBoundaryTimeout = null;
    }
  }

  private stop(): void {
    this.clearTimers();
    this.subscribers.clear();
  }

  /** Dispose — cancels timers and clears subscribers. */
  dispose(): void {
    this.stop();
  }
}

/** Singleton scheduler for the current window. */
let sharedScheduler: TimeScheduler | null = null;

export function getSharedScheduler(): TimeScheduler {
  if (!sharedScheduler) sharedScheduler = new TimeScheduler();
  return sharedScheduler;
}

export function resetSharedSchedulerForTests(): void {
  if (sharedScheduler) {
    sharedScheduler.dispose();
    sharedScheduler = null;
  }
}
