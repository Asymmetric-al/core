#!/bin/bash

# Script to update @/lib/* imports to @asym/lib/*
# Created: 2026-01-22
# Phase 4: Extract @asym/lib Package

set -e

echo "🔄 Updating @/lib imports to @asym/lib..."

# Create backup
BACKUP_DIR="backups/phase4-lib-imports-$(date +%Y%m%d-%H%M%S)"
mkdir -p "$BACKUP_DIR"
echo "📦 Creating backup at $BACKUP_DIR..."
cp -r src "$BACKUP_DIR/"

# Count files before
UTILS_COUNT=$(find src -name "*.tsx" -o -name "*.ts" | xargs grep -l 'from "@/lib/utils"' 2>/dev/null | wc -l | tr -d ' ')
STRIPE_COUNT=$(find src -name "*.tsx" -o -name "*.ts" | xargs grep -l 'from "@/lib/stripe"' 2>/dev/null | wc -l | tr -d ' ')
CLOUDINARY_COUNT=$(find src -name "*.tsx" -o -name "*.ts" | xargs grep -l 'from "@/lib/cloudinary' 2>/dev/null | wc -l | tr -d ' ')
MONITORING_COUNT=$(find src -name "*.tsx" -o -name "*.ts" | xargs grep -l 'from "@/lib/monitoring' 2>/dev/null | wc -l | tr -d ' ')
SEO_COUNT=$(find src -name "*.tsx" -o -name "*.ts" | xargs grep -l 'from "@/lib/seo' 2>/dev/null | wc -l | tr -d ' ')
RESPONSIVE_COUNT=$(find src -name "*.tsx" -o -name "*.ts" | xargs grep -l 'from "@/lib/responsive' 2>/dev/null | wc -l | tr -d ' ')
IMAGE_UTILS_COUNT=$(find src -name "*.tsx" -o -name "*.ts" | xargs grep -l 'from "@/lib/image-utils' 2>/dev/null | wc -l | tr -d ' ')
ASSETS_COUNT=$(find src -name "*.tsx" -o -name "*.ts" | xargs grep -l 'from "@/lib/assets' 2>/dev/null | wc -l | tr -d ' ')

echo "📊 Files to update:"
echo "  - @/lib/utils: $UTILS_COUNT files"
echo "  - @/lib/stripe: $STRIPE_COUNT files"
echo "  - @/lib/cloudinary-*: $CLOUDINARY_COUNT files"
echo "  - @/lib/monitoring: $MONITORING_COUNT files"
echo "  - @/lib/seo: $SEO_COUNT files"
echo "  - @/lib/responsive: $RESPONSIVE_COUNT files"
echo "  - @/lib/image-utils: $IMAGE_UTILS_COUNT files"
echo "  - @/lib/assets: $ASSETS_COUNT files"

# Update imports
echo "🔧 Updating imports..."

# 1. Update @/lib/utils → @asym/lib/utils
find src -name "*.tsx" -o -name "*.ts" | xargs sed -i '' 's|from "@/lib/utils"|from "@asym/lib/utils"|g'
find src -name "*.tsx" -o -name "*.ts" | xargs sed -i '' "s|from '@/lib/utils'|from '@asym/lib/utils'|g"

# 2. Update @/lib/stripe → @asym/lib/stripe
find src -name "*.tsx" -o -name "*.ts" | xargs sed -i '' 's|from "@/lib/stripe"|from "@asym/lib/stripe"|g'
find src -name "*.tsx" -o -name "*.ts" | xargs sed -i '' "s|from '@/lib/stripe'|from '@asym/lib/stripe'|g"

# 3. Update @/lib/cloudinary-client → @asym/lib/cloudinary
find src -name "*.tsx" -o -name "*.ts" | xargs sed -i '' 's|from "@/lib/cloudinary-client"|from "@asym/lib/cloudinary"|g'
find src -name "*.tsx" -o -name "*.ts" | xargs sed -i '' "s|from '@/lib/cloudinary-client'|from '@asym/lib/cloudinary'|g"

# 4. Update @/lib/cloudinary-server → @asym/lib/cloudinary
find src -name "*.tsx" -o -name "*.ts" | xargs sed -i '' 's|from "@/lib/cloudinary-server"|from "@asym/lib/cloudinary"|g'
find src -name "*.tsx" -o -name "*.ts" | xargs sed -i '' "s|from '@/lib/cloudinary-server'|from '@asym/lib/cloudinary'|g"

# 5. Update @/lib/monitoring → @asym/lib/monitoring
find src -name "*.tsx" -o -name "*.ts" | xargs sed -i '' 's|from "@/lib/monitoring"|from "@asym/lib/monitoring"|g'
find src -name "*.tsx" -o -name "*.ts" | xargs sed -i '' "s|from '@/lib/monitoring'|from '@asym/lib/monitoring'|g"
find src -name "*.tsx" -o -name "*.ts" | xargs sed -i '' 's|from "@/lib/monitoring/|from "@asym/lib/monitoring/|g'
find src -name "*.tsx" -o -name "*.ts" | xargs sed -i '' "s|from '@/lib/monitoring/|from '@asym/lib/monitoring/|g"

# 6. Update @/lib/seo → @asym/lib/seo
find src -name "*.tsx" -o -name "*.ts" | xargs sed -i '' 's|from "@/lib/seo"|from "@asym/lib/seo"|g'
find src -name "*.tsx" -o -name "*.ts" | xargs sed -i '' "s|from '@/lib/seo'|from '@asym/lib/seo'|g"
find src -name "*.tsx" -o -name "*.ts" | xargs sed -i '' 's|from "@/lib/seo/|from "@asym/lib/seo/|g'
find src -name "*.tsx" -o -name "*.ts" | xargs sed -i '' "s|from '@/lib/seo/|from '@asym/lib/seo/|g"

# 7. Update @/lib/responsive → @asym/lib/responsive
find src -name "*.tsx" -o -name "*.ts" | xargs sed -i '' 's|from "@/lib/responsive"|from "@asym/lib/responsive"|g'
find src -name "*.tsx" -o -name "*.ts" | xargs sed -i '' "s|from '@/lib/responsive'|from '@asym/lib/responsive'|g"

# 8. Update @/lib/image-utils → @asym/lib/image-utils
find src -name "*.tsx" -o -name "*.ts" | xargs sed -i '' 's|from "@/lib/image-utils"|from "@asym/lib/image-utils"|g'
find src -name "*.tsx" -o -name "*.ts" | xargs sed -i '' "s|from '@/lib/image-utils'|from '@asym/lib/image-utils'|g"

# 9. Update @/lib/assets → @asym/lib/assets
find src -name "*.tsx" -o -name "*.ts" | xargs sed -i '' 's|from "@/lib/assets"|from "@asym/lib/assets"|g'
find src -name "*.tsx" -o -name "*.ts" | xargs sed -i '' "s|from '@/lib/assets'|from '@asym/lib/assets'|g"

# Verify
echo "✅ Verifying updates..."
REMAINING_UTILS=$(find src -name "*.tsx" -o -name "*.ts" | xargs grep -l 'from "@/lib/utils"' 2>/dev/null | wc -l | tr -d ' ')
REMAINING_STRIPE=$(find src -name "*.tsx" -o -name "*.ts" | xargs grep -l 'from "@/lib/stripe"' 2>/dev/null | wc -l | tr -d ' ')
REMAINING_CLOUDINARY=$(find src -name "*.tsx" -o -name "*.ts" | xargs grep -l 'from "@/lib/cloudinary' 2>/dev/null | wc -l | tr -d ' ')
REMAINING_MONITORING=$(find src -name "*.tsx" -o -name "*.ts" | xargs grep -l 'from "@/lib/monitoring' 2>/dev/null | wc -l | tr -d ' ')
REMAINING_SEO=$(find src -name "*.tsx" -o -name "*.ts" | xargs grep -l 'from "@/lib/seo' 2>/dev/null | wc -l | tr -d ' ')
REMAINING_RESPONSIVE=$(find src -name "*.tsx" -o -name "*.ts" | xargs grep -l 'from "@/lib/responsive' 2>/dev/null | wc -l | tr -d ' ')
REMAINING_IMAGE_UTILS=$(find src -name "*.tsx" -o -name "*.ts" | xargs grep -l 'from "@/lib/image-utils' 2>/dev/null | wc -l | tr -d ' ')
REMAINING_ASSETS=$(find src -name "*.tsx" -o -name "*.ts" | xargs grep -l 'from "@/lib/assets' 2>/dev/null | wc -l | tr -d ' ')

echo "📊 Remaining old imports:"
echo "  - @/lib/utils: $REMAINING_UTILS files"
echo "  - @/lib/stripe: $REMAINING_STRIPE files"
echo "  - @/lib/cloudinary-*: $REMAINING_CLOUDINARY files"
echo "  - @/lib/monitoring: $REMAINING_MONITORING files"
echo "  - @/lib/seo: $REMAINING_SEO files"
echo "  - @/lib/responsive: $REMAINING_RESPONSIVE files"
echo "  - @/lib/image-utils: $REMAINING_IMAGE_UTILS files"
echo "  - @/lib/assets: $REMAINING_ASSETS files"

if [ "$REMAINING_UTILS" -eq 0 ] && [ "$REMAINING_STRIPE" -eq 0 ] && [ "$REMAINING_CLOUDINARY" -eq 0 ] && [ "$REMAINING_MONITORING" -eq 0 ] && [ "$REMAINING_SEO" -eq 0 ] && [ "$REMAINING_RESPONSIVE" -eq 0 ] && [ "$REMAINING_IMAGE_UTILS" -eq 0 ] && [ "$REMAINING_ASSETS" -eq 0 ]; then
  echo "✅ All imports updated successfully!"
else
  echo "⚠️  Some imports may still need manual updates"
fi

echo "✅ Done! Backup saved at $BACKUP_DIR"

