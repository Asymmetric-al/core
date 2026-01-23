#!/bin/bash

# Script to fix imports in @asym/ui package to use relative paths instead of @/ aliases
# This follows Turborepo best practices where packages use relative imports

cd packages/ui || exit 1

echo "Fixing @/components/ui/* imports to use ../shadcn/*..."

# Fix imports in components/feed/
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

# Fix imports in components/shadcn/
find components/shadcn -name "*.tsx" -type f -exec sed -i '' \
  -e 's|from "@/lib/responsive"|from "../../lib/responsive"|g' \
  -e 's|from "@/lib/utils"|from "../../lib/utils"|g' \
  {} \;

echo "✅ Fixed shadcn components"

# Fix imports in components/shadcn/data-grid/
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

