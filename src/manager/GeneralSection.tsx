/**
 * GeneralSection — language, regional formatting, first-run, reset positions,
 * diagnostics export, about/version.
 */

import type { ReactNode } from "react";
import type { AppSettings } from "@/shared/types";
import { invoke } from "@tauri-apps/api/core";
import { t } from "@/localization";
import { fieldStyle } from "./Manager";

export function GeneralSection({
  settings,
  onChange,
}: {
  settings: AppSettings;
  onChange: (patch: Partial<AppSettings>) => void;
}) {
  const resetPositions = async () => {
    await invoke("reset_widget_positions");
  };
  const exportDiagnostics = async () => {
    await invoke("export_diagnostics");
  };

  return (
    <section>
      <h2 style={{ marginTop: 0 }}>{t("general.title")}</h2>

      <Group title={t("general.language")}>
        <select
          value={settings.defaultLocale}
          onChange={(e) => onChange({ defaultLocale: e.target.value })}
          style={fieldStyle}
          aria-label={t("general.language")}
        >
          <option value="en">English</option>
        </select>
      </Group>

      <Group title={t("general.regionalFormatting")}>
        <select
          value={settings.defaultLocale}
          onChange={(e) => onChange({ defaultLocale: e.target.value })}
          style={fieldStyle}
          aria-label={t("general.regionalFormatting")}
        >
          <option value="en">English (system default)</option>
        </select>
      </Group>

      <Group title={t("general.firstRun")}>
        <label style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <input
            type="checkbox"
            checked={settings.firstRunComplete}
            onChange={(e) => onChange({ firstRunComplete: !e.target.checked })}
          />
          Mark first-run as complete
        </label>
      </Group>

      <Group title={t("general.resetWidgetPositions")}>
        <button onClick={resetPositions} style={buttonGhost}>
          {t("general.resetWidgetPositions")}
        </button>
      </Group>

      <Group title={t("general.exportDiagnostics")}>
        <button onClick={exportDiagnostics} style={buttonGhost}>
          {t("general.exportDiagnostics")}
        </button>
      </Group>

      <Group title={t("general.about")}>
        <p
          style={{ margin: 0, color: "var(--ot-text-secondary)", fontSize: 13 }}
        >
          {t("app.name")} {t("general.version")} 0.1.0 · {t("app.tagline")}
          <br />
          Kovina ecosystem · AGPL-3.0 · local-first, privacy-first
        </p>
      </Group>
    </section>
  );
}

function Group({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div style={{ marginBottom: 20 }}>
      <div style={{ fontWeight: 600, marginBottom: 8, fontSize: 14 }}>
        {title}
      </div>
      {children}
    </div>
  );
}

const buttonGhost: React.CSSProperties = {
  padding: "8px 14px",
  borderRadius: 6,
  border: "1px solid var(--ot-border)",
  background: "var(--ot-elevated)",
  color: "var(--ot-text)",
  cursor: "pointer",
  fontSize: 13,
};
