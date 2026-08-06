#!/usr/bin/env bash
# OpenTime production build.
# Usage: ./scripts/build.sh [--help]
set -euo pipefail

if [[ "${1:-}" == "--help" || "${1:-}" == "-h" ]]; then
  cat <<'EOF'
OpenTime production build.

Builds the frontend (tsc + vite) and, if requested, the Tauri app.

Usage:
  ./scripts/build.sh            # frontend production build
  ./scripts/build.sh --app      # frontend + Tauri (dev toolchain)
  ./scripts/build.sh --help     # show this help

Exit codes:
  0  success
  1  build failed
EOF
  exit 0
fi

cd "$(dirname "$0")/.."

echo "==> Installing dependencies (if needed)"
npm install --no-audit --no-fund >/dev/null 2>&1 || npm install

echo "==> Frontend production build"
npm run build

if [[ "${1:-}" == "--app" ]]; then
  echo "==> Tauri build (NSIS + MSI)"
  npm run tauri build -- --bundles nsis,msi
fi

echo "==> Build complete"
