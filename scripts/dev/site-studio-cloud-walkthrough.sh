#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
DATE_TAG="$(date +%Y-%m-%d)"
RUN_ROOT="${SITE_STUDIO_REVIEW_ROOT:-$ROOT_DIR/site-studio-review/$DATE_TAG/cloud-agent}"
RESULTS_DIR="$RUN_ROOT/results"
MERGED_DIR="$RUN_ROOT/merged"
SCREENSHOT_DIR="$RUN_ROOT/screenshots"
MERGED_VIDEO="$MERGED_DIR/site-studio-full-walkthrough.mp4"
CONCAT_FILE="$MERGED_DIR/concat.txt"

PROJECT="${PLAYWRIGHT_PROJECT:-chromium}"
WORKERS="${PLAYWRIGHT_WORKERS:-1}"

required_vars=(
  NEXT_PUBLIC_SUPABASE_URL
  NEXT_PUBLIC_SUPABASE_ANON_KEY
  PAYLOAD_SECRET
  PAYLOAD_DATABASE_URI
)

for name in "${required_vars[@]}"; do
  if [[ -z "${!name:-}" ]]; then
    echo "❌ Missing required env var: $name" >&2
    exit 1
  fi
done

export SKIP_ENV_VALIDATION="${SKIP_ENV_VALIDATION:-1}"
export E2E_AUTH_BYPASS="${E2E_AUTH_BYPASS:-1}"
export BUN_INSTALL="${BUN_INSTALL:-$HOME/.bun}"
export PATH="$BUN_INSTALL/bin:$PATH"

cd "$ROOT_DIR"

if [[ "${SITE_STUDIO_SKIP_INSTALL:-0}" != "1" ]]; then
  echo "▶ Installing dependencies"
  bun install
fi

echo "▶ Recording Site Studio walkthrough video"
bunx playwright test tests/e2e/site-studio-video-tour.spec.ts \
  --project="$PROJECT" \
  --workers="$WORKERS" \
  --output "$RESULTS_DIR"

shopt -s nullglob
video_paths=("$RESULTS_DIR"/site-studio-video-tour-*/video.webm)

if [[ ${#video_paths[@]} -eq 0 ]]; then
  echo "❌ No Playwright video artifacts found under: $RESULTS_DIR" >&2
  exit 1
fi

mkdir -p "$MERGED_DIR"
: > "$CONCAT_FILE"
for video in "${video_paths[@]}"; do
  printf "file '%s'\n" "$video" >> "$CONCAT_FILE"
done

echo "▶ Merging walkthrough clips"
ffmpeg -y -f concat -safe 0 -i "$CONCAT_FILE" \
  -c:v libx264 -pix_fmt yuv420p -movflags +faststart \
  "$MERGED_VIDEO"

mkdir -p "$SCREENSHOT_DIR"
echo "▶ Extracting screenshots"
ffmpeg -y -i "$MERGED_VIDEO" -vf "fps=1/2" \
  "$SCREENSHOT_DIR/site-studio-frame-%02d.png"

echo "✅ Site Studio cloud walkthrough complete"
echo "   Results: $RESULTS_DIR"
echo "   Merged video: $MERGED_VIDEO"
echo "   Screenshots: $SCREENSHOT_DIR"
