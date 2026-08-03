/**
 * React hook over the shared scheduler.
 *
 * Subscribes the consuming component to the coordinated time source. The
 * scheduler decides how often to tick based on whether any consumer wants
 * seconds. Returns the current wall-clock instant.
 */

import { useEffect, useState } from "react";
import { getSharedScheduler } from "./scheduler";

export function useNow(wantsSeconds: boolean): number {
  const scheduler = getSharedScheduler();
  const [now, setNow] = useState<number>(scheduler.current);

  useEffect(() => {
    return scheduler.subscribe((n) => setNow(n), { wantsSeconds });
  }, [scheduler, wantsSeconds]);

  return now;
}
