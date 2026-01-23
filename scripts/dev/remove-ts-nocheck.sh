#!/bin/bash
# Remove @ts-nocheck comments from moved components

echo "🧹 Removing @ts-nocheck comments..."

files=(
  "apps/admin/components/mission-control/tiles/WorkflowsPanel.tsx"
  "apps/admin/components/mission-control/tiles/QuickActionsRow.tsx"
  "apps/admin/components/mission-control/tiles/TileCard.tsx"
  "apps/admin/components/mission-control/tiles/TilePage.tsx"
  "apps/admin/components/mission-control/tiles/MissionControlHome.tsx"
  "apps/admin/components/mission-control/app-shell/ProfileMenu.tsx"
  "apps/admin/components/mission-control/app-shell/MobileSidebar.tsx"
  "apps/admin/components/mission-control/app-shell/TenantSwitcher.tsx"
  "apps/admin/components/mission-control/app-shell/SidebarNav.tsx"
  "apps/admin/components/mission-control/app-shell/GlobalSearch.tsx"
  "apps/missionary/components/feed/new-post-dialog.tsx"
  "apps/missionary/components/feed/feed-post.tsx"
)

for file in "${files[@]}"; do
  if [ -f "$file" ]; then
    echo "  Cleaning $file"
    # Remove the @ts-nocheck line and the TODO comment line
    sed -i '' '/^\/\/ @ts-nocheck$/d' "$file"
    sed -i '' '/^\/\/ TODO: This component has app-specific imports/d' "$file"
  fi
done

echo "✅ Cleanup complete!"

