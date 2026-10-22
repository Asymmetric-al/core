#!/usr/bin/env bash
# Core adaptation of the reviewed shadcn/ui setup checker.
# Read source/configuration only; never install dependencies or execute app code.
set -euo pipefail

GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'
echo "Verifying shadcn/ui setup..."
CONFIG=""
for candidate in components.json packages/ui/components.json; do
  if [ -f "$candidate" ]; then CONFIG="$candidate"; break; fi
done
if [ -z "$CONFIG" ]; then
  printf '%b\n' "$RED✗$NC components.json not found; inspect project setup instructions."
  exit 1
fi
printf '%b\n' "$GREEN✓$NC $CONFIG found"

CSS_FILE=""
for candidate in packages/ui/styles/globals.css src/index.css src/globals.css app/globals.css; do
  if [ -f "$candidate" ]; then CSS_FILE="$candidate"; break; fi
done
if [ -f tailwind.config.js ] || [ -f tailwind.config.ts ]; then
  printf '%b\n' "$GREEN✓$NC Tailwind configuration found"
elif [ -n "$CSS_FILE" ] && grep -Eq '@import[[:space:]]+["'"'"']tailwindcss["'"'"']' "$CSS_FILE"; then
  printf '%b\n' "$GREEN✓$NC Tailwind v4 CSS configuration found"
else
  printf '%b\n' "$RED✗$NC Tailwind configuration not found"
  exit 1
fi
if [ -n "$CSS_FILE" ]; then
  if grep -Eq '@tailwind base|@import[[:space:]]+["'"'"']tailwindcss["'"'"']' "$CSS_FILE"; then
    printf '%b\n' "$GREEN✓$NC Tailwind directives present"
  else
    printf '%b\n' "$YELLOW⚠$NC Tailwind directives not found in $CSS_FILE"
  fi
  if grep -Eq '^:root|@layer base' "$CSS_FILE"; then
    printf '%b\n' "$GREEN✓$NC CSS variables defined"
  else
    printf '%b\n' "$YELLOW⚠$NC Inspect shared CSS variable definitions"
  fi
fi

COMPONENTS=""
for candidate in packages/ui/components/shadcn src/components/ui components/ui; do
  if [ -d "$candidate" ]; then COMPONENTS="$candidate"; break; fi
done
if [ -n "$COMPONENTS" ]; then
  printf '%b\n' "$GREEN✓$NC $COMPONENTS exists"
else
  printf '%b\n' "$YELLOW⚠$NC Review the component path in $CONFIG"
fi

UTILS_FILE=""
for candidate in packages/ui/lib/utils.ts src/lib/utils.ts lib/utils.ts; do
  if [ -f "$candidate" ]; then UTILS_FILE="$candidate"; break; fi
done
if [ -z "$UTILS_FILE" ]; then
  printf '%b\n' "$RED✗$NC Class helper not found; inspect the configured utils alias"
  exit 1
fi
if grep -Eq "(export|import)[[:space:]].*cn.*from[[:space:]]*['\"](cn|@asym/ui/lib/utils)['\"]" "$UTILS_FILE" || grep -q 'export function cn' "$UTILS_FILE"; then
  printf '%b\n' "$GREEN✓$NC cn() utility function present in $UTILS_FILE"
else
  printf '%b\n' "$RED✗$NC cn() utility function missing"
  exit 1
fi

DEPENDENCY_FILES=()
for candidate in package.json packages/ui/package.json; do
  if [ -f "$candidate" ]; then DEPENDENCY_FILES+=("$candidate"); fi
done
if [ "${#DEPENDENCY_FILES[@]}" -gt 0 ]; then
  REQUIRED_DEPS=("react" "tailwindcss")
  RECOMMENDED_DEPS=("class-variance-authority" "cn" "tw-animate-css")
  for dep in "${REQUIRED_DEPS[@]}" "${RECOMMENDED_DEPS[@]}"; do
    if grep -q "\"$dep\"" "${DEPENDENCY_FILES[@]}"; then
      printf '%b\n' "$GREEN✓$NC $dep declared"
    else
      printf '%b\n' "$YELLOW⚠$NC Review whether $dep is needed; use the workspace manifest and ownership rules"
    fi
  done
fi
echo "Verification complete. Core components consume cn from @asym/ui/lib/utils."
