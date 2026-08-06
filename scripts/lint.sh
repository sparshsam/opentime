#!/usr/bin/env bash
# OpenTime lint + format check.
# Usage: ./scripts/lint.sh [--help]
set -euo pipefail

if [[ "${1:-}" == "--help" || "${1:-}" == "-h" ]]; then
  cat <<'EOF'
OpenTime lint + format check.

Runs prettier, ESLint, TypeScript type-checking, and rustfmt.

Usage:
  ./scripts/lint.sh           # check only (no writes)
  ./scripts/lint.sh --fix     # auto-fix formatting where possible
  ./scripts/lint.sh --help    # show this help

Exit codes:
  0  clean
  1  issues found (without --fix)
EOF
  exit 0
fi

cd "$(dirname "$0")/.."

FIX=0
[[ "${1:-}" == "--fix" ]] && FIX=1

if [[ $FIX -eq 1 ]]; then
  echo "==> Prettier (fix)"
  npx prettier --write src
else
  echo "==> Prettier (check)"
  npx prettier --check src
fi

echo "==> ESLint"
npx eslint src

echo "==> TypeScript"
npx tsc --noEmit

echo "==> rustfmt"
if [[ $FIX -eq 1 ]]; then
  cargo fmt --manifest-path src-tauri/Cargo.toml
else
  cargo fmt --manifest-path src-tauri/Cargo.toml -- --check
fi

echo "==> Lint clean"
