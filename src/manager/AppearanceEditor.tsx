/**
 * AppearanceEditor — full token editor for a widget's appearance (v0.2).
 *
 * Exposes every `AppearanceConfig` field a design supports, from the design's
 * `supportedAppearance` list. Color edits are validated for contrast against
 * the configured background; the user is warned (but not blocked) on low
 * contrast. Numeral and font styles are curated selections, not raw lists.
 */

import type {
  AppearanceConfig,
  FontStyleId,
  NumeralStyleId,
} from "@/shared/types";
import { getDesign } from "@/designs";
import { fontStyleList } from "@/shared/fonts";
import { passesContrast } from "@/shared/presets";

export function AppearanceEditor({
  appearance,
  designId,
  onChange,
}: {
  appearance: AppearanceConfig;
  designId: string;
  onChange: (next: AppearanceConfig) => void;
}) {
  const design = getDesign(designId as never);
  const supports = design.supportedAppearance;
  const has = (field: keyof AppearanceConfig) => supports.includes(field);

  const set = <K extends keyof AppearanceConfig>(
    field: K,
    value: AppearanceConfig[K],
  ) => {
    onChange({ ...appearance, [field]: value });
  };

  // Contrast validation for the active fg/bg pair.
  const fg = appearance.primaryColor;
  const bg = appearance.backgroundColor;
  const lowContrast =
    fg && bg && bg !== "transparent" && !passesContrast(fg, bg, 3.0);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      {lowContrast && (
        <div
          role="alert"
          style={{
            fontSize: 12,
            color: "#f0b400",
            background: "rgba(240,180,0,0.1)",
            border: "1px solid rgba(240,180,0,0.3)",
            borderRadius: 8,
            padding: "8px 12px",
          }}
        >
          Low contrast between text and background. Consider a darker text or
          lighter background for readability.
        </div>
      )}

      {has("fontStyle") && (
        <Field label="Typography">
          <select
            value={appearance.fontStyle}
            onChange={(e) => set("fontStyle", e.target.value as FontStyleId)}
            style={input}
          >
            {fontStyleList().map((f) => (
              <option key={f.id} value={f.id}>
                {f.label}
              </option>
            ))}
          </select>
        </Field>
      )}

      {has("numeralStyle") && (
        <Field label="Numerals">
          <div style={{ display: "flex", gap: 6 }}>
            {(["arabic", "roman", "markers-only"] as NumeralStyleId[]).map(
              (n) => (
                <label
                  key={n}
                  style={{
                    flex: 1,
                    textAlign: "center",
                    padding: "6px 8px",
                    borderRadius: 8,
                    border: `1px solid ${appearance.numeralStyle === n ? "var(--ot-accent)" : "var(--ot-border)"}`,
                    cursor: "pointer",
                    fontSize: 12,
                  }}
                >
                  <input
                    type="radio"
                    name="numeral"
                    checked={appearance.numeralStyle === n}
                    onChange={() => set("numeralStyle", n)}
                    style={{ display: "none" }}
                  />
                  {n === "arabic" ? "1 2 3" : n === "roman" ? "I II III" : "—"}
                </label>
              ),
            )}
          </div>
        </Field>
      )}

      {has("primaryColor") && (
        <ColorField
          label="Primary"
          value={appearance.primaryColor ?? ""}
          onChange={(c) => set("primaryColor", c)}
        />
      )}
      {has("secondaryColor") && (
        <ColorField
          label="Secondary"
          value={appearance.secondaryColor ?? ""}
          onChange={(c) => set("secondaryColor", c)}
        />
      )}
      {has("handColor") && (
        <ColorField
          label="Clock hands"
          value={appearance.handColor ?? ""}
          onChange={(c) => set("handColor", c)}
        />
      )}
      {has("markerColor") && (
        <ColorField
          label="Markers"
          value={appearance.markerColor ?? ""}
          onChange={(c) => set("markerColor", c)}
        />
      )}
      {has("backgroundColor") && (
        <ColorField
          label="Background"
          value={appearance.backgroundColor ?? ""}
          onChange={(c) => set("backgroundColor", c)}
        />
      )}
      {has("borderColor") && (
        <ColorField
          label="Border"
          value={appearance.borderColor ?? ""}
          onChange={(c) => set("borderColor", c)}
        />
      )}

      {has("opacity") && (
        <RangeField
          label={`Opacity ${Math.round(appearance.opacity * 100)}%`}
          min={0.2}
          max={1}
          step={0.05}
          value={appearance.opacity}
          onChange={(v) => set("opacity", v)}
        />
      )}
      {has("scale") && (
        <RangeField
          label={`Scale ${appearance.scale.toFixed(2)}×`}
          min={0.5}
          max={2}
          step={0.05}
          value={appearance.scale}
          onChange={(v) => set("scale", v)}
        />
      )}
      {has("cornerRadius") && (
        <RangeField
          label={`Corner radius ${appearance.cornerRadius}px`}
          min={0}
          max={40}
          step={1}
          value={appearance.cornerRadius}
          onChange={(v) => set("cornerRadius", v)}
        />
      )}
      {has("shadowStrength") && (
        <RangeField
          label={`Shadow ${Math.round(appearance.shadowStrength * 100)}%`}
          min={0}
          max={1}
          step={0.05}
          value={appearance.shadowStrength}
          onChange={(v) => set("shadowStrength", v)}
        />
      )}
      {has("spacing") && (
        <RangeField
          label={`Spacing ${appearance.spacing}px`}
          min={0}
          max={20}
          step={1}
          value={appearance.spacing}
          onChange={(v) => set("spacing", v)}
        />
      )}

      {has("alignment") && (
        <Field label="Alignment">
          <div style={{ display: "flex", gap: 6 }}>
            {(["start", "center", "end"] as const).map((a) => (
              <label
                key={a}
                style={{
                  flex: 1,
                  textAlign: "center",
                  padding: "6px",
                  borderRadius: 8,
                  border: `1px solid ${appearance.alignment === a ? "var(--ot-accent)" : "var(--ot-border)"}`,
                  cursor: "pointer",
                  fontSize: 12,
                }}
              >
                <input
                  type="radio"
                  name="align"
                  checked={appearance.alignment === a}
                  onChange={() => set("alignment", a)}
                  style={{ display: "none" }}
                />
                {a === "start" ? "←" : a === "center" ? "≡" : "→"}
              </label>
            ))}
          </div>
        </Field>
      )}
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label
        style={{
          display: "block",
          fontSize: 12,
          color: "var(--ot-text-secondary)",
          marginBottom: 5,
        }}
      >
        {label}
      </label>
      {children}
    </div>
  );
}

function ColorField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  const isTransparent = value === "transparent";
  return (
    <Field label={label}>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <input
          type="color"
          value={
            isTransparent
              ? "#000000"
              : /^#[0-9a-fA-F]{6}$/.test(value)
                ? value
                : "#000000"
          }
          onChange={(e) => onChange(e.target.value)}
          aria-label={`${label} color`}
          style={{
            width: 40,
            height: 30,
            border: "none",
            padding: 0,
            background: "none",
            cursor: "pointer",
          }}
        />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          aria-label={`${label} value`}
          style={{ flex: 1, ...input }}
        />
      </div>
    </Field>
  );
}

function RangeField({
  label,
  min,
  max,
  step,
  value,
  onChange,
}: {
  label: string;
  min: number;
  max: number;
  step: number;
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          fontSize: 12,
          color: "var(--ot-text-secondary)",
          marginBottom: 4,
        }}
      >
        <span>{label}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        style={{ width: "100%" }}
      />
    </div>
  );
}

const input: React.CSSProperties = {
  width: "100%",
  padding: "8px 10px",
  borderRadius: 8,
  border: "1px solid var(--ot-border)",
  background: "var(--ot-surface)",
  color: "var(--ot-text)",
  fontSize: 13,
};
