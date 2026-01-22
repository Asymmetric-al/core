#!/bin/bash

# Script to update @/config/* imports to @asym/config/*
# Created: 2026-01-22
# Phase 4.2: Extract @asym/config Package

set -e

echo "🔄 Updating @/config imports to @asym/config..."

# Create backup
BACKUP_DIR="backups/phase4-config-imports-$(date +%Y%m%d-%H%M%S)"
mkdir -p "$BACKUP_DIR"
echo "📦 Creating backup at $BACKUP_DIR..."
cp -r src "$BACKUP_DIR/"

# Count files before
CONFIG_COUNT=$(find src -name "*.tsx" -o -name "*.ts" | xargs grep -l 'from "@/config' 2>/dev/null | wc -l | tr -d ' ')

echo "📊 Files to update:"
echo "  - @/config: $CONFIG_COUNT files"

# Update imports
echo "🔧 Updating imports..."

# 1. Update @/config/constants → @asym/config/constants
find src -name "*.tsx" -o -name "*.ts" | xargs sed -i '' 's|from "@/config/constants"|from "@asym/config/constants"|g'
find src -name "*.tsx" -o -name "*.ts" | xargs sed -i '' "s|from '@/config/constants'|from '@asym/config/constants'|g"

# 2. Update @/config/site → @asym/config/site
find src -name "*.tsx" -o -name "*.ts" | xargs sed -i '' 's|from "@/config/site"|from "@asym/config/site"|g'
find src -name "*.tsx" -o -name "*.ts" | xargs sed -i '' "s|from '@/config/site'|from '@asym/config/site'|g"

# 3. Update @/config/navigation → @asym/config/navigation
find src -name "*.tsx" -o -name "*.ts" | xargs sed -i '' 's|from "@/config/navigation"|from "@asym/config/navigation"|g'
find src -name "*.tsx" -o -name "*.ts" | xargs sed -i '' "s|from '@/config/navigation'|from '@asym/config/navigation'|g"

# 4. Update @/config/tiles → @asym/config/tiles
find src -name "*.tsx" -o -name "*.ts" | xargs sed -i '' 's|from "@/config/tiles"|from "@asym/config/tiles"|g'
find src -name "*.tsx" -o -name "*.ts" | xargs sed -i '' "s|from '@/config/tiles'|from '@asym/config/tiles'|g"

# 5. Update @/config/email-studio → @asym/config/email-studio
find src -name "*.tsx" -o -name "*.ts" | xargs sed -i '' 's|from "@/config/email-studio"|from "@asym/config/email-studio"|g'
find src -name "*.tsx" -o -name "*.ts" | xargs sed -i '' "s|from '@/config/email-studio'|from '@asym/config/email-studio'|g"

# 6. Update @/config/pdf-studio → @asym/config/pdf-studio
find src -name "*.tsx" -o -name "*.ts" | xargs sed -i '' 's|from "@/config/pdf-studio"|from "@asym/config/pdf-studio"|g'
find src -name "*.tsx" -o -name "*.ts" | xargs sed -i '' "s|from '@/config/pdf-studio'|from '@asym/config/pdf-studio'|g"

# 7. Update @/config (barrel import) → @asym/config
find src -name "*.tsx" -o -name "*.ts" | xargs sed -i '' 's|from "@/config"|from "@asym/config"|g'
find src -name "*.tsx" -o -name "*.ts" | xargs sed -i '' "s|from '@/config'|from '@asym/config'|g"

# Verify
echo "✅ Verifying updates..."
REMAINING_CONFIG=$(find src -name "*.tsx" -o -name "*.ts" | xargs grep -l 'from "@/config' 2>/dev/null | wc -l | tr -d ' ')

echo "📊 Remaining old imports:"
echo "  - @/config: $REMAINING_CONFIG files"

if [ "$REMAINING_CONFIG" -eq 0 ]; then
  echo "✅ All imports updated successfully!"
else
  echo "⚠️  Some imports may still need manual updates"
  echo "Files with remaining @/config imports:"
  find src -name "*.tsx" -o -name "*.ts" | xargs grep -l 'from "@/config' 2>/dev/null | head -10
fi

echo "✅ Done! Backup saved at $BACKUP_DIR"

