#!/bin/bash

# One-off rewrite from the January 2026 Turborepo migration: @asym/ui imports
# switched from @/ aliases to relative paths. packages/ui now maps `@/*` in its
# own tsconfig. Kept for history; do not rerun (components/feed no longer
# exists). Uses BSD/macOS `sed -i ''` syntax.

cd packages/ui || exit 1

echo "Fixing @/components/ui/* imports to use ../shadcn/*..."

find components/feed -name "*.tsx" -type f -exec sed -i '' \
  -e 's|from "@/components/ui/dialog"|from "../shadcn/dialog"|g' \
  -e 's|from "@/components/ui/avatar"|from "../shadcn/avatar"|g' \
  -e 's|from "@/components/ui/button"|from "../shadcn/button"|g' \
  -e 's|from "@/components/ui/input"|from "../shadcn/input"|g' \
  -e 's|from "@/components/ui/spinner"|from "../shadcn/spinner"|g' \
  -e 's|from "@/components/ui/scroll-area"|from "../shadcn/scroll-area"|g' \
  -e 's|from "@/components/ui/card"|from "../shadcn/card"|g' \
  -e 's|from "@/components/ui/carousel"|from "../shadcn/carousel"|g' \
  -e 's|from "@/components/ui/textarea"|from "../shadcn/textarea"|g' \
  -e 's|from "@/lib/utils"|from "../../lib/utils"|g' \
  {} \;

echo "✅ Fixed feed components"

find components/shadcn -name "*.tsx" -type f -exec sed -i '' \
  -e 's|from "@/lib/responsive"|from "../../lib/responsive"|g' \
  -e 's|from "@/lib/utils"|from "../../lib/utils"|g' \
  {} \;

echo "✅ Fixed shadcn components"

find components/shadcn/data-grid -name "*.tsx" -type f -exec sed -i '' \
  -e 's|from "../types"|from "./types"|g' \
  -e 's|from "../data-grid-cell"|from "./data-grid-cell"|g' \
  {} \;

echo "✅ Fixed data-grid components"

echo ""
echo "Done! Now checking for remaining @/ imports..."
echo ""

grep -r "@/" components/ --include="*.tsx" --include="*.ts" | grep -v "node_modules" | grep -v "@/types" | grep -v "@/lib/mission-control" | grep -v "@/assets" || echo "No remaining @/components or @/lib/utils imports found!"

echo ""
echo "Remaining app-specific imports (these components should be moved to apps):"
grep -r "@/types\|@/lib/mission-control\|@/assets" components/ --include="*.tsx" --include="*.ts" | grep -v "node_modules" | cut -d: -f1 | sort -u

