/**
 * Root component — resolves the boot context and renders the correct surface.
 *
 * Widget windows are created with a label of the form `widget-<uuid>` and are
 * booted with a widgetId query/hash so the React tree knows which record to
 * load. The manager window uses the label `manager`.
 */

import { useEffect, useState } from "react";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { Manager } from "@/manager/Manager";
import { WidgetSurface } from "@/widgets/WidgetSurface";
import type { BootContext } from "@/shared/types";
import { wireResumeHandling } from "@/shared/resume";

function resolveContext(): BootContext {
  // In the Tauri runtime the window label is authoritative. In a pure web
  // preview (vitest / vite without Tauri) we fall back to the URL hash.
  try {
    const label = getCurrentWindow().label;
    if (label === "manager") return { kind: "manager" };
    if (label.startsWith("widget-")) {
      const widgetId = label.replace(/^widget-/, "");
      return { kind: "widget", widgetId };
    }
  } catch {
    /* not running inside Tauri */
  }
  const hash = window.location.hash.replace(/^#/, "");
  const params = new URLSearchParams(hash);
  const kind = params.get("kind");
  if (kind === "widget") {
    return { kind: "widget", widgetId: params.get("widgetId") ?? "" };
  }
  return { kind: "manager" };
}

export function App() {
  const [ctx] = useState<BootContext>(resolveContext);
  const [booted, setBooted] = useState(false);

  useEffect(() => {
    // Correct clocks immediately after the system resumes from sleep.
    wireResumeHandling();
    // Allow the DOM/theme to settle before rendering clocks.
    setBooted(true);
  }, []);

  if (!booted) return null;

  if (ctx.kind === "widget") {
    return <WidgetSurface widgetId={ctx.widgetId} />;
  }
  return <Manager />;
}
