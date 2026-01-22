#!/bin/bash

# Script to update @/lib/email/* and @/types/email* imports to @asym/email/*
# Created: 2026-01-22
# Phase 4.4: Extract @asym/email Package

set -e

echo "🔄 Updating @/lib/email and @/types/email imports to @asym/email..."

# Create backup
BACKUP_DIR="backups/phase4-email-imports-$(date +%Y%m%d-%H%M%S)"
mkdir -p "$BACKUP_DIR"
echo "📦 Creating backup at $BACKUP_DIR..."
cp -r src "$BACKUP_DIR/"

# Count files before
EMAIL_LIB_COUNT=$(find src -name "*.tsx" -o -name "*.ts" | xargs grep -l 'from "@/lib/email' 2>/dev/null | wc -l | tr -d ' ')
EMAIL_TYPES_COUNT=$(find src -name "*.tsx" -o -name "*.ts" | xargs grep -l 'from "@/types/email' 2>/dev/null | wc -l | tr -d ' ')

echo "📊 Files to update:"
echo "  - @/lib/email: $EMAIL_LIB_COUNT files"
echo "  - @/types/email: $EMAIL_TYPES_COUNT files"

# Update imports
echo "🔧 Updating imports..."

# 1. Update @/lib/email → @asym/email
find src -name "*.tsx" -o -name "*.ts" | xargs sed -i '' 's|from "@/lib/email"|from "@asym/email"|g'
find src -name "*.tsx" -o -name "*.ts" | xargs sed -i '' "s|from '@/lib/email'|from '@asym/email'|g"

# 2. Update @/types/email → @asym/email/types
find src -name "*.tsx" -o -name "*.ts" | xargs sed -i '' 's|from "@/types/email"|from "@asym/email/types"|g'
find src -name "*.tsx" -o -name "*.ts" | xargs sed -i '' "s|from '@/types/email'|from '@asym/email/types'|g"

# 3. Update @/types/email-studio → @asym/email/email-studio-types
find src -name "*.tsx" -o -name "*.ts" | xargs sed -i '' 's|from "@/types/email-studio"|from "@asym/email/email-studio-types"|g'
find src -name "*.tsx" -o -name "*.ts" | xargs sed -i '' "s|from '@/types/email-studio'|from '@asym/email/email-studio-types'|g"

# Verify
echo "✅ Verifying updates..."
REMAINING_EMAIL_LIB=$(find src -name "*.tsx" -o -name "*.ts" | xargs grep -l 'from "@/lib/email' 2>/dev/null | wc -l | tr -d ' ')
REMAINING_EMAIL_TYPES=$(find src -name "*.tsx" -o -name "*.ts" | xargs grep -l 'from "@/types/email' 2>/dev/null | wc -l | tr -d ' ')

echo "📊 Remaining old imports:"
echo "  - @/lib/email: $REMAINING_EMAIL_LIB files"
echo "  - @/types/email: $REMAINING_EMAIL_TYPES files"

if [ "$REMAINING_EMAIL_LIB" -eq 0 ] && [ "$REMAINING_EMAIL_TYPES" -eq 0 ]; then
  echo "✅ All imports updated successfully!"
else
  echo "⚠️  Some imports may still need manual updates"
  echo "Files with remaining @/lib/email imports:"
  find src -name "*.tsx" -o -name "*.ts" | xargs grep -l 'from "@/lib/email' 2>/dev/null | head -10
  echo "Files with remaining @/types/email imports:"
  find src -name "*.tsx" -o -name "*.ts" | xargs grep -l 'from "@/types/email' 2>/dev/null | head -10
fi

echo "✅ Done! Backup saved at $BACKUP_DIR"

