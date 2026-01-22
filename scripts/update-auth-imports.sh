#!/bin/bash

# Script to update @/lib/auth/* and @/hooks/use-auth imports to @asym/auth/*
# Created: 2026-01-22
# Phase 4.3: Extract @asym/auth Package

set -e

echo "🔄 Updating @/lib/auth and @/hooks/use-auth imports to @asym/auth..."

# Create backup
BACKUP_DIR="backups/phase4-auth-imports-$(date +%Y%m%d-%H%M%S)"
mkdir -p "$BACKUP_DIR"
echo "📦 Creating backup at $BACKUP_DIR..."
cp -r src "$BACKUP_DIR/"

# Count files before
AUTH_CONTEXT_COUNT=$(find src -name "*.tsx" -o -name "*.ts" | xargs grep -l 'from "@/lib/auth' 2>/dev/null | wc -l | tr -d ' ')
USE_AUTH_COUNT=$(find src -name "*.tsx" -o -name "*.ts" | xargs grep -l 'from "@/hooks/use-auth' 2>/dev/null | wc -l | tr -d ' ')

echo "📊 Files to update:"
echo "  - @/lib/auth: $AUTH_CONTEXT_COUNT files"
echo "  - @/hooks/use-auth: $USE_AUTH_COUNT files"

# Update imports
echo "🔧 Updating imports..."

# 1. Update @/lib/auth/context → @asym/auth/context
find src -name "*.tsx" -o -name "*.ts" | xargs sed -i '' 's|from "@/lib/auth/context"|from "@asym/auth/context"|g'
find src -name "*.tsx" -o -name "*.ts" | xargs sed -i '' "s|from '@/lib/auth/context'|from '@asym/auth/context'|g"

# 2. Update @/lib/auth → @asym/auth
find src -name "*.tsx" -o -name "*.ts" | xargs sed -i '' 's|from "@/lib/auth"|from "@asym/auth"|g'
find src -name "*.tsx" -o -name "*.ts" | xargs sed -i '' "s|from '@/lib/auth'|from '@asym/auth'|g"

# 3. Update @/hooks/use-auth → @asym/auth/use-auth
find src -name "*.tsx" -o -name "*.ts" | xargs sed -i '' 's|from "@/hooks/use-auth"|from "@asym/auth/use-auth"|g'
find src -name "*.tsx" -o -name "*.ts" | xargs sed -i '' "s|from '@/hooks/use-auth'|from '@asym/auth/use-auth'|g"

# Verify
echo "✅ Verifying updates..."
REMAINING_AUTH=$(find src -name "*.tsx" -o -name "*.ts" | xargs grep -l 'from "@/lib/auth' 2>/dev/null | wc -l | tr -d ' ')
REMAINING_USE_AUTH=$(find src -name "*.tsx" -o -name "*.ts" | xargs grep -l 'from "@/hooks/use-auth' 2>/dev/null | wc -l | tr -d ' ')

echo "📊 Remaining old imports:"
echo "  - @/lib/auth: $REMAINING_AUTH files"
echo "  - @/hooks/use-auth: $REMAINING_USE_AUTH files"

if [ "$REMAINING_AUTH" -eq 0 ] && [ "$REMAINING_USE_AUTH" -eq 0 ]; then
  echo "✅ All imports updated successfully!"
else
  echo "⚠️  Some imports may still need manual updates"
  echo "Files with remaining @/lib/auth imports:"
  find src -name "*.tsx" -o -name "*.ts" | xargs grep -l 'from "@/lib/auth' 2>/dev/null | head -10
  echo "Files with remaining @/hooks/use-auth imports:"
  find src -name "*.tsx" -o -name "*.ts" | xargs grep -l 'from "@/hooks/use-auth' 2>/dev/null | head -10
fi

echo "✅ Done! Backup saved at $BACKUP_DIR"

