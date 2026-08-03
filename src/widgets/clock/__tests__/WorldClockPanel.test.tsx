import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { WorldClockPanel } from "../WorldClockPanel";
import type { WorldClockRow } from "@/shared/types";

// Minimal appearance config for the panel.
const appearance = {
  presetId: "dark",
  backgroundColor: "#111111",
  borderColor: "#2a2a2a",
  cornerRadius: 12,
  scale: 1,
  primaryColor: "#f9f9f9",
  secondaryColor: "#b3b3b3",
} as never;

const rows: WorldClockRow[] = [
  {
    timezoneId: "America/Toronto",
    label: "TORONTO",
    showDate: false,
    showUtcOffset: false,
    showAbbreviation: false,
  },
  {
    timezoneId: "Asia/Kolkata",
    label: "MUMBAI",
    showDate: false,
    showUtcOffset: false,
    showAbbreviation: false,
  },
];

describe("WorldClockPanel", () => {
  it("renders every row label and the local time", () => {
    render(
      <WorldClockPanel
        rows={rows}
        appearance={appearance}
        hourCycle={24}
        showSeconds={false}
        referenceTimezoneId="UTC"
        previewNow={Date.UTC(2026, 0, 15, 12, 0, 0)}
      />,
    );
    expect(screen.getByText("TORONTO")).toBeTruthy();
    expect(screen.getByText("MUMBAI")).toBeTruthy();
    // Toronto at 12:00 UTC in January is 07:00
    expect(screen.getByText("07:00")).toBeTruthy();
    // Kolkata at 12:00 UTC is 17:30
    expect(screen.getByText("17:30")).toBeTruthy();
  });

  it("shows a day-change indicator when a row is on a different day", () => {
    render(
      <WorldClockPanel
        rows={[
          {
            timezoneId: "Asia/Kolkata",
            label: "MUMBAI",
            showDate: false,
            showUtcOffset: false,
            showAbbreviation: false,
          },
        ]}
        appearance={appearance}
        hourCycle={24}
        showSeconds={false}
        referenceTimezoneId="UTC"
        previewNow={Date.UTC(2026, 0, 15, 23, 30, 0)}
      />,
    );
    // 23:30 UTC → Kolkata is 05:00 next day → "+1"
    expect(screen.getByText("+1")).toBeTruthy();
  });

  it("exposes an accessible label including the day state", () => {
    render(
      <WorldClockPanel
        rows={[
          {
            timezoneId: "Asia/Kolkata",
            label: "MUMBAI",
            showDate: false,
            showUtcOffset: false,
            showAbbreviation: false,
          },
        ]}
        appearance={appearance}
        hourCycle={24}
        showSeconds={false}
        referenceTimezoneId="UTC"
        previewNow={Date.UTC(2026, 0, 15, 23, 30, 0)}
      />,
    );
    // The time cell's aria-label includes the day state, e.g. "05:00, next day".
    const timeCell = screen.getByLabelText(/next day/);
    expect(timeCell.textContent).toContain("05:00");
  });
});
