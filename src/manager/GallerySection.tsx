/**
 * GallerySection — the clock gallery (v0.2).
 *
 * Shows design families (digital / analog / world clock), live previews of the
 * current time, appearance presets, and each design's supported capabilities.
 * Applying a design preserves compatible settings and safely resets
 * incompatible ones.
 */

import { useState } from "react";
import type {
  AppearanceConfig,
  AppearancePresetId,
  DesignFamily,
  WidgetRecord,
} from "@/shared/types";
import { designsByFamily, getDesign } from "@/designs";
import { presetList, applyPresetColors } from "@/shared/presets";
import { api } from "@/persistence/api";
import { ClockWidget } from "@/widgets/clock/ClockWidget";
import { t } from "@/localization";

interface GallerySectionProps {
  widgets: WidgetRecord[];
  onChange: () => void;
}

export function GallerySection({ widgets, onChange }: GallerySectionProps) {
  const [family, setFamily] = useState<DesignFamily>("digital");
  const [presetId, setPresetId] = useState<AppearancePresetId>("dark");
  const [applied, setApplied] = useState<string | null>(null);

  const designs = designsByFamily(family);
  const now = Date.now();

  const previewWidget = (id: WidgetRecord["designId"]): WidgetRecord => ({
    id: "__preview__",
    widgetType: "clock",
    designId: id,
    timezoneId: "America/Toronto",
    label: "Toronto",
    hourCycle: 12,
    showSeconds: true,
    showDate: true,
    showTimezoneLabel: true,
    appearance: applyPresetColors(defaultAppearance(), presetId),
    displayId: "primary",
    logicalX: 0,
    logicalY: 0,
    logicalWidth: 320,
    logicalHeight: 160,
    scale: 1,
    opacity: 1,
    locked: true,
    hidden: false,
    worldRows: [],
    createdAt: "",
    updatedAt: "",
  });

  const applyDesign = async (designId: WidgetRecord["designId"]) => {
    const target = widgets[0];
    if (!target) return;
    const design = getDesign(designId);
    // Preserve compatible fields, reset incompatible ones safely.
    const patch: Partial<WidgetRecord> = {
      designId,
      showSeconds: design.capabilities.seconds ? target.showSeconds : false,
      showDate: design.capabilities.date ? target.showDate : false,
      showTimezoneLabel: design.capabilities.timezoneLabel
        ? target.showTimezoneLabel
        : false,
    };
    await api.updateWidget({ id: target.id, patch });
    setApplied(designId);
    setTimeout(() => setApplied(null), 1600);
    onChange();
  };

  return (
    <section>
      <h2 style={{ marginTop: 0 }}>{t("gallery.title")}</h2>

      {/* Family tabs */}
      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        {(["digital", "analog", "world-clock"] as DesignFamily[]).map((f) => (
          <button
            key={f}
            onClick={() => setFamily(f)}
            style={{
              padding: "6px 14px",
              borderRadius: 20,
              border: "1px solid var(--ot-border)",
              background: family === f ? "#7a004b" : "var(--ot-elevated)",
              color: family === f ? "#fff" : "var(--ot-text-secondary)",
              cursor: "pointer",
              fontSize: 13,
            }}
          >
            {f === "digital"
              ? t("gallery.digital")
              : f === "analog"
                ? t("gallery.analog")
                : t("gallery.worldClock")}
          </button>
        ))}
      </div>

      {/* Preset picker */}
      <label
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 8,
          marginBottom: 20,
          fontSize: 13,
        }}
      >
        {t("appearance.defaultPreset")}
        <select
          value={presetId}
          onChange={(e) => setPresetId(e.target.value as AppearancePresetId)}
          style={{
            padding: "6px 10px",
            borderRadius: 6,
            border: "1px solid var(--ot-border)",
            background: "var(--ot-elevated)",
            color: "var(--ot-text)",
          }}
        >
          {presetList().map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
      </label>

      {/* Design grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
          gap: 16,
        }}
      >
        {designs.map((d) => {
          const isApplied = applied === d.id;
          return (
            <div
              key={d.id}
              style={{
                border: `1px solid ${isApplied ? "#7a004b" : "var(--ot-border)"}`,
                borderRadius: 10,
                padding: 12,
                background: "var(--ot-surface)",
              }}
            >
              <div
                style={{
                  height: 120,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background:
                    presetId === "dark" || presetId === "high-contrast"
                      ? "rgba(0,0,0,0.35)"
                      : "rgba(0,0,0,0.12)",
                  borderRadius: 6,
                  overflow: "hidden",
                }}
                aria-hidden="true"
              >
                <div
                  style={{
                    transform: "scale(0.62)",
                    transformOrigin: "center",
                  }}
                >
                  <ClockWidget widget={previewWidget(d.id)} previewNow={now} />
                </div>
              </div>
              <div style={{ marginTop: 10, fontWeight: 600, fontSize: 13 }}>
                {d.name}
              </div>
              <div
                style={{
                  fontSize: 12,
                  color: "var(--ot-text-secondary)",
                  marginTop: 2,
                  minHeight: 32,
                }}
              >
                {d.description}
              </div>
              <Capabilities designId={d.id} />
              <button
                onClick={() => applyDesign(d.id)}
                disabled={!widgets.length}
                style={{
                  width: "100%",
                  marginTop: 10,
                  padding: "7px 0",
                  borderRadius: 6,
                  border: "none",
                  background: isApplied ? "#7a004b" : "var(--ot-elevated)",
                  color: isApplied ? "#fff" : "var(--ot-text)",
                  cursor: "pointer",
                  fontSize: 12,
                }}
              >
                {isApplied ? "Applied" : t("gallery.apply")}
              </button>
            </div>
          );
        })}
      </div>

      {!widgets.length && (
        <p
          style={{
            color: "var(--ot-text-secondary)",
            marginTop: 16,
            fontSize: 13,
          }}
        >
          Add a clock first, then apply designs to it.
        </p>
      )}
    </section>
  );
}

function Capabilities({ designId }: { designId: WidgetRecord["designId"] }) {
  const d = getDesign(designId);
  const caps = [
    [t("gallery.supportsSeconds"), d.capabilities.seconds],
    [t("gallery.supportsDate"), d.capabilities.date],
    [t("gallery.supportsTimezoneLabel"), d.capabilities.timezoneLabel],
    [t("gallery.supportsBackground"), d.capabilities.background],
    [t("gallery.supportsAnimation"), d.capabilities.animation],
  ] as const;
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 6 }}>
      {caps.map(([label, supported]) => (
        <span
          key={label}
          title={label}
          style={{
            fontSize: 10,
            padding: "2px 6px",
            borderRadius: 10,
            background: supported
              ? "rgba(126,203,126,0.15)"
              : "rgba(255,255,255,0.06)",
            color: supported ? "#7ecb7e" : "var(--ot-text-tertiary)",
          }}
        >
          {label}
        </span>
      ))}
    </div>
  );
}

function defaultAppearance(): AppearanceConfig {
  return {
    presetId: "dark",
    primaryColor: "#f9f9f9",
    secondaryColor: "#b3b3b3",
    handColor: "#f9f9f9",
    markerColor: "#b3b3b3",
    backgroundColor: "#111111",
    borderColor: "#2a2a2a",
    opacity: 1,
    cornerRadius: 12,
    shadowStrength: 0,
    alignment: "center",
    spacing: 4,
    scale: 1,
    numeralStyle: "arabic",
    fontStyle: "geometric-sans",
  };
}
