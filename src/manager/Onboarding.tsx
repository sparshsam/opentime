/**
 * Onboarding — concise first-run welcome (v0.1).
 *
 * Explains that OpenTime places clocks on the desktop, asks about Windows
 * startup, and teaches drag / right-click / lock. Skippable. English-only for
 * these versions; strings are translation-ready via `t()`.
 */

import { useState } from "react";
import type { CSSProperties } from "react";
import type { AppSettings } from "@/shared/types";
import { api } from "@/persistence/api";
import { t } from "@/localization";

export function Onboarding({
  settings,
  onComplete,
}: {
  settings: AppSettings;
  onComplete: () => void;
}) {
  const [startWithWindows, setStartWithWindows] = useState(
    settings.startupEnabled,
  );
  const [busy, setBusy] = useState(false);

  const finish = async (skipStartup = false) => {
    setBusy(true);
    try {
      if (!skipStartup && startWithWindows) {
        // Attempt registration; on failure keep the UI honest.
        try {
          const actual = await api.setStartupEnabled(true);
          await api.updateSettings({
            ...settings,
            startupEnabled: actual,
            firstRunComplete: true,
          });
        } catch {
          await api.updateSettings({
            ...settings,
            startupEnabled: false,
            firstRunComplete: true,
          });
        }
      } else {
        await api.updateSettings({ ...settings, firstRunComplete: true });
      }
      onComplete();
    } finally {
      setBusy(false);
    }
  };

  return (
    <div
      style={{
        maxWidth: 520,
        margin: "0 auto",
        padding: "48px 32px",
        textAlign: "center",
      }}
      role="dialog"
      aria-label={t("onboarding.welcome")}
    >
      <div style={{ fontSize: 34, fontWeight: 800, letterSpacing: "-0.03em" }}>
        {t("app.name")}
      </div>
      <div
        style={{
          fontSize: 15,
          color: "var(--ot-text-secondary)",
          marginTop: 8,
        }}
      >
        {t("app.tagline")}
      </div>

      <p style={{ marginTop: 28, lineHeight: 1.6, color: "var(--ot-text)" }}>
        {t("onboarding.explanation")}
      </p>

      <label
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 8,
          marginTop: 20,
          fontSize: 14,
        }}
      >
        <input
          type="checkbox"
          checked={startWithWindows}
          onChange={(e) => setStartWithWindows(e.target.checked)}
        />
        {t("onboarding.startWithWindows")}
      </label>

      <div
        style={{
          marginTop: 20,
          fontSize: 13,
          color: "var(--ot-text-secondary)",
          lineHeight: 1.6,
        }}
      >
        <div>{t("onboarding.clockCreated")}</div>
        <div>• {t("onboarding.dragHint")}</div>
        <div>• {t("onboarding.rightClickHint")}</div>
        <div>• {t("onboarding.lockHint")}</div>
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "center",
          gap: 12,
          marginTop: 32,
        }}
      >
        <button onClick={() => finish(true)} disabled={busy} style={ghostBtn}>
          {t("onboarding.skip")}
        </button>
        <button
          onClick={() => finish(false)}
          disabled={busy}
          style={primaryBtn}
        >
          {t("onboarding.finish")}
        </button>
      </div>
    </div>
  );
}

const ghostBtn: CSSProperties = {
  padding: "10px 20px",
  borderRadius: 999,
  border: "1px solid var(--ot-border)",
  background: "transparent",
  color: "var(--ot-text-secondary)",
  cursor: "pointer",
  fontSize: 13,
};

const primaryBtn: CSSProperties = {
  padding: "10px 24px",
  borderRadius: 999,
  border: "none",
  background: "var(--ot-accent)",
  color: "#fff",
  cursor: "pointer",
  fontSize: 13,
  fontWeight: 600,
};
