#!/bin/bash
# One-off import rewrite from the January 2026 Turborepo component migration.
# Kept for history; do not rerun. It still rewrites imports across the live
# apps/admin, apps/missionary and apps/donor trees, and it uses BSD/macOS
# `sed -i ''` syntax.

echo "🔧 Fixing imports in apps..."

echo "📝 Fixing admin imports..."
find apps/admin -name "*.tsx" -o -name "*.ts" | xargs sed -i '' \
  -e 's|@asym/ui/components/mission-control|@/components/mission-control|g' \
  -e 's|@asym/ui/components/dashboard|@/components/dashboard|g' \
  -e 's|@asym/ui/components/app-header|@/components/app-header|g' \
  -e 's|@asym/ui/components/app-shell|@/components/app-shell|g' \
  -e 's|@asym/ui/components/app-sidebar|@/components/app-sidebar|g' \
  -e 's|@asym/ui/components/page-header|@/components/page-header|g'

echo "📝 Fixing missionary imports..."
find apps/missionary -name "*.tsx" -o -name "*.ts" | xargs sed -i '' \
  -e 's|@asym/ui/components/feed|@/components/feed|g'

# Public donor components stayed in @asym/ui (shared).
echo "📝 Fixing donor imports..."
find apps/donor -name "*.tsx" -o -name "*.ts" | xargs sed -i '' \
  -e 's|@asym/ui/components/donor|@/components/donor|g' \
  -e 's|@asym/ui/components/dashboard-footer|@/components/dashboard-footer|g'

echo "✅ Import fixes complete!"

