#!/bin/bash
# One-off rewrite from the January 2026 Turborepo component migration: moved
# components import shadcn primitives from @asym/ui.
# Kept for history; do not rerun. Its target paths no longer exist, and it uses
# BSD/macOS `sed -i ''` syntax.

echo "🔧 Fixing imports in moved components..."

echo "📝 Fixing dashboard components..."
find apps/admin/components/dashboard -name "*.tsx" -exec sed -i '' \
  -e 's|from "../shadcn/|from "@asym/ui/components/shadcn/|g' \
  -e 's|from "../../lib/utils"|from "@asym/ui/lib/utils"|g' \
  {} \;

echo "📝 Fixing mission-control components..."
find apps/admin/components/mission-control -name "*.tsx" -exec sed -i '' \
  -e 's|from "../shadcn/|from "@asym/ui/components/shadcn/|g' \
  -e 's|from "../../lib/utils"|from "@asym/ui/lib/utils"|g' \
  {} \;

echo "📝 Fixing feed components..."
find apps/missionary/components/feed -name "*.tsx" -exec sed -i '' \
  -e 's|from "../shadcn/|from "@asym/ui/components/shadcn/|g' \
  -e 's|from "../../lib/utils"|from "@asym/ui/lib/utils"|g' \
  {} \;

echo "✅ Import fixes complete!"

