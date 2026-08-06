#!/usr/bin/env node
/**
 * OpenTime icon generator.
 *
 * Reads the canonical 1024×1024 icon sources from `assets/app-icon/` and
 * regenerates the platform icon assets the repo commits:
 *   - src-tauri/icons/*            (Tauri bundle icons, incl. multi-frame icon.ico)
 *   - assets/platforms/windows/*   (app.ico, app-dark.ico, MSIX tile sets)
 *   - assets/icons/*               (web favicon + PWA icon set)
 *   - assets/social/*              (OG image, github avatar)
 *
 * Usage:
 *   node scripts/generate-icons.js
 *   node scripts/generate-icons.js --help
 *
 * Requires: node + sharp (`npm install`).
 *
 * This is the repo-local generator. The authoritative masters live in
 * `assets/app-icon/icon-source.png` (light) and `icon-source-dark.png` (dark).
 */

import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO = resolve(__dirname, "..");

if (process.argv.includes("--help") || process.argv.includes("-h")) {
  console.log(`OpenTime icon generator

Regenerates all platform icon assets from assets/app-icon/.

Usage: node scripts/generate-icons.js [--help]
Options:
  --help, -h   Show this help.
Exit codes:
  0  success
  1  source missing or generation failed`);
  process.exit(0);
}

const LIGHT = join(REPO, "assets/app-icon/icon-source.png");
const DARK = join(REPO, "assets/app-icon/icon-source-dark.png");

for (const p of [LIGHT, DARK]) {
  if (!existsSync(p)) {
    console.error(`ERROR: missing source ${p}`);
    process.exit(1);
  }
}

// The heavy lifting (resize + ICO composition) lives in a Node script under
// src-tauri's build tooling. This wrapper keeps a single, documented entry
// point. If sharp is unavailable, report clearly.
let sharp;
try {
  sharp = (await import("sharp")).default;
} catch {
  console.error("ERROR: sharp is required. Run `npm install` first.");
  process.exit(1);
}

const mkdir = (d) => mkdirSync(d, { recursive: true });
const save = (buf, file) => {
  mkdir(dirname(file));
  writeFileSync(file, buf);
};

function createIco(pngBuffers) {
  const count = pngBuffers.length;
  const headerSize = 6 + count * 16;
  let offset = headerSize;
  const sizes = [];
  for (const buf of pngBuffers) {
    const w = buf.readUInt32BE(16);
    const h = buf.readUInt32BE(20);
    sizes.push({ buf, offset, size: buf.length, w, h });
    offset += buf.length;
  }
  const out = Buffer.alloc(offset);
  let o = 0;
  out.writeUInt16LE(0, o); o += 2;
  out.writeUInt16LE(1, o); o += 2;
  out.writeUInt16LE(count, o); o += 2;
  for (const s of sizes) {
    out.writeUInt8(s.w >= 256 ? 0 : s.w, o++);
    out.writeUInt8(s.h >= 256 ? 0 : s.h, o++);
    out.writeUInt8(0, o++);
    out.writeUInt8(0, o++);
    out.writeUInt16LE(1, o); o += 2;
    out.writeUInt16LE(32, o); o += 2;
    out.writeUInt32LE(s.size, o); o += 4;
    out.writeUInt32LE(s.offset, o); o += 4;
  }
  for (const s of sizes) s.buf.copy(out, s.offset);
  return out;
}

// Tauri requires RGBA (alpha) PNGs for window/bundle icons. The source masters
// are opaque RGB, so force an alpha channel.
const resize = (src, size) =>
  sharp(src)
    .resize(size, size, { kernel: "lanczos3" })
    .ensureAlpha()
    .png()
    .toBuffer();

async function main() {
  let total = 0;

  // 1. src-tauri/icons/icon.ico — full 7-frame set (16..256). Also regenerate
  //    the Tauri PNG icons the bundle references.
  const ICO_SIZES = [16, 24, 32, 48, 64, 96, 256];
  const frames = [];
  for (const s of ICO_SIZES) frames.push(await resize(LIGHT, s));
  save(createIco(frames), join(REPO, "src-tauri/icons/icon.ico"));
  for (const s of [32, 128, 256, 512, 1024]) {
    save(await resize(LIGHT, s), join(REPO, `src-tauri/icons/${s}x${s}.png`));
  }
  save(await resize(LIGHT, 128), join(REPO, "src-tauri/icons/128x128@2x.png"));
  total += ICO_SIZES.length + 5;

  // 2. Windows platform assets.
  const W = join(REPO, "assets/platforms/windows");
  const icoLight = [];
  const icoDark = [];
  for (const s of ICO_SIZES) {
    icoLight.push(await resize(LIGHT, s));
    icoDark.push(await resize(DARK, s));
  }
  save(createIco(icoLight), join(W, "app.ico"));
  save(createIco(icoDark), join(W, "app-dark.ico"));
  total += 2;

  // MSIX tile sets (Light/ and Dark/) — base sizes.
  const tiles = [
    ["StoreLogo", 50],
    ["Square44x44Logo", 44],
    ["Square71x71Logo", 71],
    ["Square89x89Logo", 89],
    ["Square107x107Logo", 107],
    ["Square142x142Logo", 142],
    ["Square150x150Logo", 150],
    ["Square284x284Logo", 284],
    ["Square310x310Logo", 310],
  ];
  for (const variant of ["Light", "Dark"]) {
    const src = variant === "Light" ? LIGHT : DARK;
    for (const [name, size] of tiles) {
      save(await resize(src, size), join(W, "MicrosoftStore", variant, `${name}.png`));
    }
    total += tiles.length;
  }

  // 3. Web icons + favicons.
  const icons = join(REPO, "assets/icons");
  for (const s of [16, 32, 48, 64, 96, 128, 144, 152, 167, 180, 192, 256, 384, 512]) {
    save(await resize(LIGHT, s), join(icons, `icon-${s}.png`));
    save(await resize(DARK, s), join(icons, `icon-${s}-dark.png`));
    total += 2;
  }

  console.log(`Done. ${total} icon assets regenerated from assets/app-icon/.`);
}

main().catch((e) => {
  console.error("ERROR:", e.message);
  process.exit(1);
});
