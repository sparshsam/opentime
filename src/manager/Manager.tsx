/**
 * OpenTime Manager — the conventional configuration window.
 *
 * Closing the manager must not quit OpenTime or close widgets; the Rust tray
 * keeps the process alive. This surface drives widget CRUD, settings, startup,
 * and the gallery.
 */

import { useCallback, useEffect, useState } from "react";
import type { AppSettings, MonitorInfo, WidgetRecord } from "@/shared/types";
import { api } from "@/persistence/api";
import { invoke } from "@tauri-apps/api/core";
import { WidgetsSection } from "./WidgetsSection";
import { StartupSection } from "./StartupSection";
import { GeneralSection } from "./GeneralSection";
import { AppearanceEditor } from "./AppearanceEditor";
import { GallerySection } from "./GallerySection";
import { Onboarding } from "./Onboarding";
import { t } from "@/localization";

type SectionId = "widgets" | "gallery" | "appearance" | "startup" | "general";

export function Manager() {
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [widgets, setWidgets] = useState<WidgetRecord[]>([]);
  const [monitors, setMonitors] = useState<MonitorInfo[]>([]);
  const [section, setSection] = useState<SectionId>("widgets");
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      const [s, w, m] = await Promise.all([
        api.getSettings(),
        api.listWidgets(),
        api.listMonitors(),
      ]);
      setSettings(s);
      setWidgets(w);
      setMonitors(m);
      setError(null);
    } catch (e) {
      setError(String(e));
    }
  }, []);

  useEffect(() => {
    document.body.classList.add("ot-manager");
    refresh();
    return () => document.body.classList.remove("ot-manager");
  }, [refresh]);

  const updateSettings = async (patch: Partial<AppSettings>) => {
    if (!settings) return;
    const next = { ...settings, ...patch };
    setSettings(next);
    await api.updateSettings(next);
  };

  if (error) {
    return (
      <div style={{ padding: 24, color: "#f66" }}>
        <h1>OpenTime</h1>
        <p>Failed to load: {error}</p>
        <button onClick={refresh}>Retry</button>
      </div>
    );
  }
  if (!settings) return <div style={{ padding: 24 }}>Loading…</div>;

  if (!settings.firstRunComplete) {
    return (
      <div style={{ height: "100vh" }}>
        <Onboarding settings={settings} onComplete={refresh} />
      </div>
    );
  }

  return (
    <div style={{ display: "flex", height: "100vh" }}>
      {/* Sidebar */}
      <nav
        aria-label="Manager sections"
        style={{
          width: 200,
          borderRight: "1px solid var(--ot-border)",
          background: "var(--ot-surface)",
          padding: "16px 8px",
          display: "flex",
          flexDirection: "column",
          gap: 2,
        }}
      >
        <div
          style={{
            padding: "0 12px 14px",
            fontSize: 16,
            fontWeight: 800,
            letterSpacing: "-0.02em",
            color: "#fff",
          }}
        >
          OpenTime
        </div>
        {(
          [
            ["widgets", t("nav.widgets")],
            ["gallery", t("nav.gallery")],
            ["appearance", t("nav.appearance")],
            ["startup", t("nav.startup")],
            ["general", t("nav.general")],
          ] as [SectionId, string][]
        ).map(([id, label]) => (
          <button
            key={id}
            onClick={() => setSection(id)}
            aria-current={section === id ? "page" : undefined}
            style={{
              display: "block",
              width: "100%",
              textAlign: "left",
              padding: "8px 12px",
              borderRadius: 6,
              border: "none",
              background: section === id ? "var(--ot-elevated)" : "transparent",
              color: section === id ? "#fff" : "var(--ot-text-secondary)",
              cursor: "pointer",
              fontSize: 13,
            }}
          >
            {label}
          </button>
        ))}
        <div style={{ flex: 1 }} />
        <div
          style={{
            padding: "8px 12px",
            fontSize: 11,
            color: "var(--ot-text-tertiary)",
          }}
        >
          v0.1.0 · local-only
        </div>
      </nav>

      {/* Content */}
      <main style={{ flex: 1, overflow: "auto", padding: 24 }}>
        {section === "widgets" && (
          <WidgetsSection
            widgets={widgets}
            monitors={monitors}
            settings={settings}
            onChange={refresh}
            onCreate={async () => {
              await invoke("add_widget");
              refresh();
            }}
          />
        )}
        {section === "gallery" && (
          <GallerySection widgets={widgets} onChange={refresh} />
        )}
        {section === "appearance" && (
          <AppearanceSection
            settings={settings}
            widgets={widgets}
            onChange={updateSettings}
            onRefresh={refresh}
          />
        )}
        {section === "startup" && (
          <StartupSection settings={settings} onChange={updateSettings} />
        )}
        {section === "general" && (
          <GeneralSection settings={settings} onChange={updateSettings} />
        )}
      </main>
    </div>
  );
}

// ── Appearance section — default settings + per-widget token editor ──

function AppearanceSection({
  settings,
  widgets,
  onChange,
  onRefresh,
}: {
  settings: AppSettings;
  widgets: WidgetRecord[];
  onChange: (patch: Partial<AppSettings>) => void;
  onRefresh: () => void;
}) {
  const [selectedId, setSelectedId] = useState<string | null>(
    widgets[0]?.id ?? null,
  );
  const selected =
    widgets.find((w) => w.id === selectedId) ?? widgets[0] ?? null;
  const [saving, setSaving] = useState(false);

  const saveAppearance = async (appearance: WidgetRecord["appearance"]) => {
    if (!selected) return;
    setSaving(true);
    try {
      await api.updateWidget({ id: selected.id, patch: { appearance } });
      onRefresh();
    } finally {
      setSaving(false);
    }
  };

  return (
    <section>
      <h2 style={{ marginTop: 0 }}>{t("appearance.title")}</h2>

      <label style={{ display: "block", marginBottom: 16 }}>
        Widget
        <select
          value={selected?.id ?? ""}
          onChange={(e) => setSelectedId(e.target.value)}
          style={fieldStyle}
        >
          {widgets.map((w) => (
            <option key={w.id} value={w.id}>
              {w.label || w.timezoneId}
            </option>
          ))}
        </select>
      </label>

      {selected ? (
        <>
          <AppearanceEditor
            appearance={selected.appearance}
            designId={selected.designId}
            onChange={saveAppearance}
          />
          {saving && (
            <div
              style={{
                fontSize: 12,
                color: "var(--ot-text-tertiary)",
                marginTop: 8,
              }}
            >
              Saving…
            </div>
          )}
        </>
      ) : (
        <p style={{ color: "var(--ot-text-secondary)" }}>
          Add a clock to edit its appearance.
        </p>
      )}

      <hr
        style={{
          border: "none",
          borderTop: "1px solid var(--ot-border)",
          margin: "24px 0",
        }}
      />

      <h3 style={{ marginTop: 0, fontSize: 15 }}>Defaults</h3>

      <label style={{ display: "block", marginBottom: 12 }}>
        {t("appearance.defaultHourCycle")}
        <select
          value={settings.defaultHourCycle}
          onChange={(e) =>
            onChange({ defaultHourCycle: Number(e.target.value) as 12 | 24 })
          }
          style={fieldStyle}
        >
          <option value={12}>12-hour</option>
          <option value={24}>24-hour</option>
        </select>
      </label>
      <label
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          marginBottom: 8,
        }}
      >
        <input
          type="checkbox"
          checked={settings.reducedMotion}
          onChange={(e) => onChange({ reducedMotion: e.target.checked })}
        />
        {t("appearance.reducedMotion")}
      </label>
      <label style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <input
          type="checkbox"
          checked={settings.highContrast}
          onChange={(e) => onChange({ highContrast: e.target.checked })}
        />
        {t("appearance.highContrast")}
      </label>
    </section>
  );
}

export const fieldStyle: React.CSSProperties = {
  display: "block",
  marginTop: 6,
  padding: "8px 10px",
  borderRadius: 6,
  border: "1px solid var(--ot-border)",
  background: "var(--ot-elevated)",
  color: "var(--ot-text)",
  fontSize: 13,
};
