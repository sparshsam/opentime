/**
 * StartupSection — Windows sign-in startup setting with honest state.
 *
 * The real registration state is read from the platform (HKCU Run key) and
 * shown to the user. Enabling/disabling is a Tauri command that reports whether
 * registration actually succeeded — the UI never claims success on failure.
 */

import { useEffect, useState } from "react";
import type { AppSettings } from "@/shared/types";
import { api } from "@/persistence/api";
import { t } from "@/localization";

export function StartupSection({
  settings,
  onChange,
}: {
  settings: AppSettings;
  onChange: (patch: Partial<AppSettings>) => void;
}) {
  const [realStartupState, setRealStartupState] = useState<boolean | null>(
    null,
  );
  const [stateError, setStateError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const refreshState = async () => {
    try {
      const v = await api.getStartupEnabled();
      setRealStartupState(v);
      setStateError(null);
    } catch (e) {
      setStateError(String(e));
    }
  };

  useEffect(() => {
    refreshState();
  }, []);

  const toggleStartup = async (enabled: boolean) => {
    setSaving(true);
    try {
      const actual = await api.setStartupEnabled(enabled);
      setRealStartupState(actual);
      await onChange({ startupEnabled: actual });
    } catch (e) {
      setStateError(String(e));
    } finally {
      setSaving(false);
    }
  };

  const effective = realStartupState ?? settings.startupEnabled;

  return (
    <section>
      <h2 style={{ marginTop: 0 }}>{t("startup.title")}</h2>

      <label
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          marginBottom: 16,
        }}
      >
        <input
          type="checkbox"
          checked={effective}
          disabled={saving}
          onChange={(e) => toggleStartup(e.target.checked)}
        />
        {t("startup.startWithWindows")}
      </label>

      <label
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          marginBottom: 16,
        }}
      >
        <input
          type="checkbox"
          checked={settings.launchManagerAtStartup}
          disabled={!effective}
          onChange={(e) =>
            onChange({ launchManagerAtStartup: e.target.checked })
          }
        />
        {t("startup.launchManagerAtStartup")}
      </label>

      <label
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          marginBottom: 24,
        }}
      >
        <input
          type="checkbox"
          checked={settings.restoreHiddenWidgets}
          onChange={(e) => onChange({ restoreHiddenWidgets: e.target.checked })}
        />
        {t("startup.restoreHiddenWidgets")}
      </label>

      <div style={{ fontSize: 13, color: "var(--ot-text-secondary)" }}>
        <div style={{ fontWeight: 600, marginBottom: 4 }}>
          {t("startup.status")}
        </div>
        {stateError ? (
          <span style={{ color: "#e88" }}>
            {t("startup.statusFailed")} — {stateError}
          </span>
        ) : effective ? (
          <span style={{ color: "#7ecb7e" }}>{t("startup.statusEnabled")}</span>
        ) : (
          <span>{t("startup.statusDisabled")}</span>
        )}
      </div>
    </section>
  );
}
