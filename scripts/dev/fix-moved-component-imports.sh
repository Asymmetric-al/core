#!/bin/bash
# Fix imports in moved components to use @asym/ui for shadcn components

echo "🔧 Fixing imports in moved components..."

# Fix dashboard components in admin
echo "📝 Fixing dashboard components..."
find apps/admin/components/dashboard -name "*.tsx" -exec sed -i '' \
  -e 's|from "../shadcn/|from "@asym/ui/components/shadcn/|g' \
  -e 's|from "../../lib/utils"|from "@asym/ui/lib/utils"|g' \
  {} \;

# Fix mission-control components in admin
echo "📝 Fixing mission-control components..."
find apps/admin/components/mission-control -name "*.tsx" -exec sed -i '' \
  -e 's|from "../shadcn/|from "@asym/ui/components/shadcn/|g' \
  -e 's|from "../../lib/utils"|from "@asym/ui/lib/utils"|g' \
  {} \;

# Fix feed components in missionary
echo "📝 Fixing feed components..."
find apps/missionary/components/feed -name "*.tsx" -exec sed -i '' \
  -e 's|from "../shadcn/|from "@asym/ui/components/shadcn/|g' \
  -e 's|from "../../lib/utils"|from "@asym/ui/lib/utils"|g' \
  {} \;

echo "✅ Import fixes complete!"

