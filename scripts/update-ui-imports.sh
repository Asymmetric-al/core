#!/bin/bash
# Script to update imports from @/components/ui to @asym/ui
# Phase 2: Extract @asym/ui Package

set -e

echo "🔄 Updating imports to use @asym/ui package..."
echo ""

# Count files before
UI_COUNT=$(find src -name "*.tsx" -o -name "*.ts" | xargs grep -l "@/components/ui" 2>/dev/null | wc -l | tr -d ' ')
DASHBOARD_COUNT=$(find src -name "*.tsx" -o -name "*.ts" | xargs grep -l "@/components/dashboard" 2>/dev/null | wc -l | tr -d ' ')
UTILS_COUNT=$(find src -name "*.tsx" -o -name "*.ts" | xargs grep -l "from \"@/lib/utils\"" 2>/dev/null | wc -l | tr -d ' ')

echo "📊 Files to update:"
echo "  - @/components/ui: $UI_COUNT files"
echo "  - @/components/dashboard: $DASHBOARD_COUNT files"
echo "  - @/lib/utils (cn): $UTILS_COUNT files"
echo ""

# Backup
echo "💾 Creating backup..."
BACKUP_DIR="backups/phase2-imports-$(date +%Y%m%d-%H%M%S)"
mkdir -p "$BACKUP_DIR"
cp -r src "$BACKUP_DIR/"
echo "✅ Backup created at: $BACKUP_DIR"
echo ""

# Update @/components/ui/* to @asym/ui/components/shadcn/*
echo "🔧 Updating @/components/ui imports..."
find src -name "*.tsx" -o -name "*.ts" | while read file; do
  if grep -q "@/components/ui" "$file" 2>/dev/null; then
    sed -i '' 's|@/components/ui/|@asym/ui/components/shadcn/|g' "$file"
    sed -i '' 's|@/components/ui"|@asym/ui/components/shadcn"|g' "$file"
    sed -i '' "s|@/components/ui'|@asym/ui/components/shadcn'|g" "$file"
  fi
done

# Update @/components/dashboard to @asym/ui/components/dashboard
echo "🔧 Updating @/components/dashboard imports..."
find src -name "*.tsx" -o -name "*.ts" | while read file; do
  if grep -q "@/components/dashboard" "$file" 2>/dev/null; then
    sed -i '' 's|@/components/dashboard|@asym/ui/components/dashboard|g' "$file"
  fi
done

# Update @/components/feed to @asym/ui/components/feed
echo "🔧 Updating @/components/feed imports..."
find src -name "*.tsx" -o -name "*.ts" | while read file; do
  if grep -q "@/components/feed" "$file" 2>/dev/null; then
    sed -i '' 's|@/components/feed|@asym/ui/components/feed|g' "$file"
  fi
done

# Update @/hooks/use-mobile to @asym/ui/hooks
echo "🔧 Updating @/hooks/use-mobile imports..."
find src -name "*.tsx" -o -name "*.ts" | while read file; do
  if grep -q "@/hooks/use-mobile" "$file" 2>/dev/null; then
    sed -i '' 's|@/hooks/use-mobile|@asym/ui/hooks|g' "$file"
  fi
done

# Note: We're NOT updating all @/lib/utils imports because some files use
# other functions like formatCurrency, getInitials which will stay in @/lib/utils
# Only the cn() function is in @asym/ui/lib

echo ""
echo "✅ Import updates complete!"
echo ""

# Count files after
UI_COUNT_AFTER=$(find src -name "*.tsx" -o -name "*.ts" | xargs grep -l "@/components/ui" 2>/dev/null | wc -l | tr -d ' ')
DASHBOARD_COUNT_AFTER=$(find src -name "*.tsx" -o -name "*.ts" | xargs grep -l "@/components/dashboard" 2>/dev/null | wc -l | tr -d ' ')

echo "📊 Verification:"
echo "  - @/components/ui remaining: $UI_COUNT_AFTER files (should be 0)"
echo "  - @/components/dashboard remaining: $DASHBOARD_COUNT_AFTER files (should be 0)"
echo ""

if [ "$UI_COUNT_AFTER" -eq 0 ] && [ "$DASHBOARD_COUNT_AFTER" -eq 0 ]; then
  echo "✅ All imports updated successfully!"
else
  echo "⚠️  Some imports may need manual review"
fi

echo ""
echo "🔍 Next steps:"
echo "  1. Run: bun install"
echo "  2. Run: turbo dev"
echo "  3. Check for TypeScript errors"
echo "  4. Test the application"
echo ""
echo "💡 To restore backup if needed:"
echo "  rm -rf src && cp -r $BACKUP_DIR/src ."

