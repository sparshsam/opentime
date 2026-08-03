/**
 * ClockWidget — the top-level widget renderer.
 *
 * Dispatches to the right design renderer based on the widget's designId and
 * design family. Keeps design resolution in one place so the widget window and
 * the gallery preview share identical rendering.
 */

import type { DigitalDesignId, WidgetRecord } from "@/shared/types";
import { getDesign } from "@/designs";
import { DigitalClock } from "./DigitalClock";
import { AnalogClock } from "./AnalogClock";
import { WorldClockPanel, type WorldClockPanelProps } from "./WorldClockPanel";

export interface ClockWidgetProps {
  widget: WidgetRecord;
  previewNow?: number;
  locale?: string;
  /** Reference zone used for the panel's day-change indicators. */
  referenceTimezoneId?: string;
  /** Optional panel heading. */
  heading?: string;
}

export function ClockWidget({
  widget,
  previewNow,
  locale = "en",
  referenceTimezoneId,
  heading,
}: ClockWidgetProps) {
  const design = getDesign(widget.designId);

  switch (design.family) {
    case "analog":
      return (
        <AnalogClock widget={widget} previewNow={previewNow} locale={locale} />
      );
    case "world-clock": {
      const rows: WorldClockPanelProps["rows"] = widget.worldRows.map((r) => ({
        timezoneId: r.timezoneId,
        label: r.label,
        showDate: r.showDate,
        showUtcOffset: r.showUtcOffset,
        showAbbreviation: r.showAbbreviation,
      }));
      return (
        <WorldClockPanel
          rows={rows}
          appearance={widget.appearance}
          hourCycle={widget.hourCycle}
          showSeconds={widget.showSeconds}
          referenceTimezoneId={referenceTimezoneId ?? widget.timezoneId}
          locale={locale}
          previewNow={previewNow}
          heading={heading}
        />
      );
    }
    case "digital":
    default:
      return (
        <DigitalClock
          widget={widget}
          design={widget.designId as DigitalDesignId}
          previewNow={previewNow}
          locale={locale}
        />
      );
  }
}
