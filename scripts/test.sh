#!/usr/bin/env bash
# OpenTime test suite.
# Usage: ./scripts/test.sh [--help]
set -euo pipefail

if [[ "${1:-}" == "--help" || "${1:-}" == "-h" ]]; then
  cat <<'EOF'
OpenTime test suite.

Runs the full automated test suite (frontend + Rust) on the current platform.

Usage:
  ./scripts/test.sh           # frontend tests + Rust tests
  ./scripts/test.sh --help    # show this help

Exit codes:
  0  all tests pass
  1  a test suite failed
EOF
  exit 0
fi

cd "$(dirname "$0")/.."

echo "==> Frontend tests (Vitest)"
npx vitest run

echo "==> Rust unit tests"
cargo test --manifest-path src-tauri/Cargo.toml

echo "==> All tests passed"
