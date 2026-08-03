/**
 * Frontend persistence API — thin typed wrappers over Tauri commands.
 *
 * The Rust side owns the SQLite database and validates every input. This
 * module keeps the UI free of IPC plumbing and provides a single seam that is
 * easy to mock in tests.
 */

import { invoke } from "@tauri-apps/api/core";
import type {
  AppSettings,
  CreateWidgetInput,
  DuplicateWidgetResult,
  MonitorInfo,
  UpdateWidgetInput,
  WidgetRecord,
} from "@/shared/types";

export interface PersistenceApi {
  getSettings(): Promise<AppSettings>;
  updateSettings(settings: AppSettings): Promise<AppSettings>;
  listWidgets(): Promise<WidgetRecord[]>;
  getWidget(id: string): Promise<WidgetRecord | null>;
  createWidget(input: CreateWidgetInput): Promise<WidgetRecord>;
  updateWidget(input: UpdateWidgetInput): Promise<WidgetRecord>;
  deleteWidget(id: string): Promise<void>;
  duplicateWidget(id: string): Promise<DuplicateWidgetResult>;
  listMonitors(): Promise<MonitorInfo[]>;
  /** Persist a widget's position/size after drag/resize (debounced upstream). */
  saveWidgetGeometry(
    id: string,
    x: number,
    y: number,
    width: number,
    height: number,
  ): Promise<WidgetRecord>;
  getStartupEnabled(): Promise<boolean>;
  setStartupEnabled(enabled: boolean): Promise<boolean>;
  /** Run migrations up to the latest schema version. Returns new version. */
  migrate(): Promise<number>;
}

export const api: PersistenceApi = {
  getSettings: () => invoke("get_settings"),
  updateSettings: (settings) => invoke("update_settings", { settings }),
  listWidgets: () => invoke("list_widgets"),
  getWidget: (id) => invoke("get_widget", { id }),
  createWidget: (input) => invoke("create_widget", { input }),
  updateWidget: (input) => invoke("update_widget", { input }),
  deleteWidget: (id) => invoke("delete_widget", { id }),
  duplicateWidget: (id) => invoke("duplicate_widget", { id }),
  listMonitors: () => invoke("list_monitors"),
  saveWidgetGeometry: (id, x, y, width, height) =>
    invoke("save_widget_geometry", { id, x, y, width, height }),
  getStartupEnabled: () => invoke("get_startup_enabled"),
  setStartupEnabled: (enabled) => invoke("set_startup_enabled", { enabled }),
  migrate: () => invoke("migrate"),
};
