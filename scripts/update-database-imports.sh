#!/bin/bash
# Script to update imports from @/lib/supabase and @/lib/db to @asym/database
# Phase 3: Extract @asym/database Package

set -e

echo "🔄 Updating imports to use @asym/database package..."
echo ""

# Count files before
SUPABASE_COUNT=$(find src -name "*.tsx" -o -name "*.ts" | xargs grep -l "@/lib/supabase" 2>/dev/null | wc -l | tr -d ' ')
DB_COUNT=$(find src -name "*.tsx" -o -name "*.ts" | xargs grep -l "@/lib/db" 2>/dev/null | wc -l | tr -d ' ')
TYPES_COUNT=$(find src -name "*.tsx" -o -name "*.ts" | xargs grep -l "@/types/database" 2>/dev/null | wc -l | tr -d ' ')

echo "📊 Files to update:"
echo "  - @/lib/supabase: $SUPABASE_COUNT files"
echo "  - @/lib/db: $DB_COUNT files"
echo "  - @/types/database: $TYPES_COUNT files"
echo ""

# Backup
echo "💾 Creating backup..."
BACKUP_DIR="backups/phase3-imports-$(date +%Y%m%d-%H%M%S)"
mkdir -p "$BACKUP_DIR"
cp -r src "$BACKUP_DIR/"
echo "✅ Backup created at: $BACKUP_DIR"
echo ""

# Update @/lib/supabase/* to @asym/database/supabase/*
echo "🔧 Updating @/lib/supabase imports..."
find src -name "*.tsx" -o -name "*.ts" | while read file; do
  if grep -q "@/lib/supabase" "$file" 2>/dev/null; then
    # Update specific imports
    sed -i '' 's|from "@/lib/supabase/client"|from "@asym/database/supabase"|g' "$file"
    sed -i '' 's|from "@/lib/supabase/server"|from "@asym/database/supabase"|g' "$file"
    sed -i '' 's|from "@/lib/supabase/admin"|from "@asym/database/supabase"|g' "$file"
    sed -i '' 's|from "@/lib/supabase/proxy"|from "@asym/database/supabase"|g' "$file"
    sed -i '' 's|from "@/lib/supabase"|from "@asym/database/supabase"|g' "$file"
    
    # Handle single quotes
    sed -i '' "s|from '@/lib/supabase/client'|from '@asym/database/supabase'|g" "$file"
    sed -i '' "s|from '@/lib/supabase/server'|from '@asym/database/supabase'|g" "$file"
    sed -i '' "s|from '@/lib/supabase/admin'|from '@asym/database/supabase'|g" "$file"
    sed -i '' "s|from '@/lib/supabase/proxy'|from '@asym/database/supabase'|g" "$file"
    sed -i '' "s|from '@/lib/supabase'|from '@asym/database/supabase'|g" "$file"
  fi
done

# Update @/lib/db/* to @asym/database/*
echo "🔧 Updating @/lib/db imports..."
find src -name "*.tsx" -o -name "*.ts" | while read file; do
  if grep -q "@/lib/db" "$file" 2>/dev/null; then
    # Collections
    sed -i '' 's|from "@/lib/db/collections"|from "@asym/database/collections"|g' "$file"
    sed -i '' 's|from "@/lib/db"|from "@asym/database/collections"|g' "$file"
    
    # Hooks
    sed -i '' 's|from "@/lib/db/hooks"|from "@asym/database/hooks"|g' "$file"
    
    # Providers
    sed -i '' 's|from "@/lib/db/query-provider"|from "@asym/database/providers"|g' "$file"
    sed -i '' 's|from "@/lib/db/provider"|from "@asym/database/providers"|g' "$file"
    
    # Handle single quotes
    sed -i '' "s|from '@/lib/db/collections'|from '@asym/database/collections'|g" "$file"
    sed -i '' "s|from '@/lib/db'|from '@asym/database/collections'|g" "$file"
    sed -i '' "s|from '@/lib/db/hooks'|from '@asym/database/hooks'|g" "$file"
    sed -i '' "s|from '@/lib/db/query-provider'|from '@asym/database/providers'|g" "$file"
    sed -i '' "s|from '@/lib/db/provider'|from '@asym/database/providers'|g" "$file"
  fi
done

# Update @/types/database to @asym/database/types
echo "🔧 Updating @/types/database imports..."
find src -name "*.tsx" -o -name "*.ts" | while read file; do
  if grep -q "@/types/database" "$file" 2>/dev/null; then
    sed -i '' 's|from "@/types/database"|from "@asym/database/types"|g' "$file"
    sed -i '' "s|from '@/types/database'|from '@asym/database/types'|g" "$file"
  fi
done

echo ""
echo "✅ Import updates complete!"
echo ""

# Count files after
SUPABASE_COUNT_AFTER=$(find src -name "*.tsx" -o -name "*.ts" | xargs grep -l "@/lib/supabase" 2>/dev/null | wc -l | tr -d ' ')
DB_COUNT_AFTER=$(find src -name "*.tsx" -o -name "*.ts" | xargs grep -l "@/lib/db" 2>/dev/null | wc -l | tr -d ' ')
TYPES_COUNT_AFTER=$(find src -name "*.tsx" -o -name "*.ts" | xargs grep -l "@/types/database" 2>/dev/null | wc -l | tr -d ' ')

echo "📊 Verification:"
echo "  - @/lib/supabase remaining: $SUPABASE_COUNT_AFTER files (should be 0)"
echo "  - @/lib/db remaining: $DB_COUNT_AFTER files (should be 0)"
echo "  - @/types/database remaining: $TYPES_COUNT_AFTER files (should be 0)"
echo ""

if [ "$SUPABASE_COUNT_AFTER" -eq 0 ] && [ "$DB_COUNT_AFTER" -eq 0 ] && [ "$TYPES_COUNT_AFTER" -eq 0 ]; then
  echo "✅ All imports updated successfully!"
else
  echo "⚠️  Some imports may need manual review"
fi

echo ""
echo "🔍 Next steps:"
echo "  1. Run: bun install"
echo "  2. Run: bun dev"
echo "  3. Check for TypeScript errors"
echo "  4. Test database connections"
echo ""
echo "💡 To restore backup if needed:"
echo "  rm -rf src && cp -r $BACKUP_DIR/src ."

