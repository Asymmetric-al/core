#!/bin/bash

# Script to update imports in apps/admin
# Created: 2026-01-22
# Phase 5: Create apps/admin

set -e

echo "🔄 Updating imports in apps/admin..."

# Create backup
BACKUP_DIR="backups/phase5-admin-imports-$(date +%Y%m%d-%H%M%S)"
mkdir -p "$BACKUP_DIR"
echo "📦 Creating backup at $BACKUP_DIR..."
cp -r apps/admin "$BACKUP_DIR/"

# Count files before
FEATURES_COUNT=$(find apps/admin -name "*.tsx" -o -name "*.ts" | xargs grep -l '@/features' 2>/dev/null | wc -l | tr -d ' ')
COMPONENTS_COUNT=$(find apps/admin -name "*.tsx" -o -name "*.ts" | xargs grep -l '@/components' 2>/dev/null | wc -l | tr -d ' ')
LIB_COUNT=$(find apps/admin -name "*.tsx" -o -name "*.ts" | xargs grep -l '@/lib' 2>/dev/null | wc -l | tr -d ' ')

echo "📊 Files to update:"
echo "  - @/features: $FEATURES_COUNT files"
echo "  - @/components: $COMPONENTS_COUNT files"
echo "  - @/lib: $LIB_COUNT files"

# Update imports
echo "🔧 Updating imports..."

# 1. Update @/features/mission-control → @/features/mission-control (keep as is, it's now local)
# No change needed - it's already in the right place

# 2. Update @/components/ui → @asym/ui/components/shadcn
find apps/admin -name "*.tsx" -o -name "*.ts" | xargs sed -i '' 's|from "@/components/ui/|from "@asym/ui/components/shadcn/|g'
find apps/admin -name "*.tsx" -o -name "*.ts" | xargs sed -i '' "s|from '@/components/ui/|from '@asym/ui/components/shadcn/|g"

# 3. Update @/components/dashboard → @asym/ui/components/dashboard
find apps/admin -name "*.tsx" -o -name "*.ts" | xargs sed -i '' 's|from "@/components/dashboard/|from "@asym/ui/components/dashboard/|g'
find apps/admin -name "*.tsx" -o -name "*.ts" | xargs sed -i '' "s|from '@/components/dashboard/|from '@asym/ui/components/dashboard/|g"

# 4. Update @/components/feed → @asym/ui/components/feed
find apps/admin -name "*.tsx" -o -name "*.ts" | xargs sed -i '' 's|from "@/components/feed/|from "@asym/ui/components/feed/|g'
find apps/admin -name "*.tsx" -o -name "*.ts" | xargs sed -i '' "s|from '@/components/feed/|from '@asym/ui/components/feed/|g"

# 5. Update @/lib/utils → @asym/lib/utils
find apps/admin -name "*.tsx" -o -name "*.ts" | xargs sed -i '' 's|from "@/lib/utils"|from "@asym/lib/utils"|g'
find apps/admin -name "*.tsx" -o -name "*.ts" | xargs sed -i '' "s|from '@/lib/utils'|from '@asym/lib/utils'|g"

# 6. Update @/lib/supabase → @asym/database/supabase
find apps/admin -name "*.tsx" -o -name "*.ts" | xargs sed -i '' 's|from "@/lib/supabase/|from "@asym/database/supabase/|g'
find apps/admin -name "*.tsx" -o -name "*.ts" | xargs sed -i '' "s|from '@/lib/supabase/|from '@asym/database/supabase/|g"

# 7. Update @/lib/db → @asym/database/collections
find apps/admin -name "*.tsx" -o -name "*.ts" | xargs sed -i '' 's|from "@/lib/db/|from "@asym/database/collections/|g'
find apps/admin -name "*.tsx" -o -name "*.ts" | xargs sed -i '' "s|from '@/lib/db/|from '@asym/database/collections/|g"

# 8. Update @/hooks/use-auth → @asym/auth/use-auth
find apps/admin -name "*.tsx" -o -name "*.ts" | xargs sed -i '' 's|from "@/hooks/use-auth"|from "@asym/auth/use-auth"|g'
find apps/admin -name "*.tsx" -o -name "*.ts" | xargs sed -i '' "s|from '@/hooks/use-auth'|from '@asym/auth/use-auth'|g"

# 9. Update @/config → @asym/config
find apps/admin -name "*.tsx" -o -name "*.ts" | xargs sed -i '' 's|from "@/config/|from "@asym/config/|g'
find apps/admin -name "*.tsx" -o -name "*.ts" | xargs sed -i '' "s|from '@/config/|from '@asym/config/|g"

# 10. Update @/types → @asym/database/types
find apps/admin -name "*.tsx" -o -name "*.ts" | xargs sed -i '' 's|from "@/types"|from "@asym/database/types"|g'
find apps/admin -name "*.tsx" -o -name "*.ts" | xargs sed -i '' "s|from '@/types'|from '@asym/database/types'|g"

# Verify
echo "✅ Verifying updates..."
REMAINING_FEATURES=$(find apps/admin -name "*.tsx" -o -name "*.ts" | xargs grep -l '@/features' 2>/dev/null | wc -l | tr -d ' ')
REMAINING_COMPONENTS=$(find apps/admin -name "*.tsx" -o -name "*.ts" | xargs grep -l '@/components' 2>/dev/null | wc -l | tr -d ' ')
REMAINING_LIB=$(find apps/admin -name "*.tsx" -o -name "*.ts" | xargs grep -l '@/lib' 2>/dev/null | wc -l | tr -d ' ')

echo "📊 Remaining old imports:"
echo "  - @/features: $REMAINING_FEATURES files (expected: 22 - local features)"
echo "  - @/components: $REMAINING_COMPONENTS files (expected: 0)"
echo "  - @/lib: $REMAINING_LIB files (expected: 1 - theme-provider)"

if [ "$REMAINING_COMPONENTS" -eq 0 ]; then
  echo "✅ All component imports updated successfully!"
else
  echo "⚠️  Some component imports may still need manual updates"
  echo "Files with remaining @/components imports:"
  find apps/admin -name "*.tsx" -o -name "*.ts" | xargs grep -l '@/components' 2>/dev/null | head -10
fi

echo "✅ Done! Backup saved at $BACKUP_DIR"

