/**
 * OpenTime frontend entry.
 *
 * Boots into either the Manager window or a Widget window based on the
 * window label passed at creation time.
 */

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "@/app/App";
import "@/app/globals.css";

const rootEl = document.getElementById("root");
if (!rootEl) throw new Error("Missing #root element");

createRoot(rootEl).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
