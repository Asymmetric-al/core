#!/bin/bash

# Fix cn imports in donor and missionary apps
# cn is in @asym/ui/lib/utils, not @asym/lib/utils

echo "Fixing cn imports in donor and missionary apps..."

# Function to fix imports in a file
fix_file() {
  local file="$1"
  echo "Processing: $file"
  
  # Check if file imports cn from @asym/lib/utils
  if grep -q "import.*cn.*from '@asym/lib/utils'" "$file"; then
    # Case 1: Only cn is imported
    if grep -q "import { cn } from '@asym/lib/utils'" "$file"; then
      sed -i '' "s|import { cn } from '@asym/lib/utils'|import { cn } from '@asym/ui/lib/utils'|g" "$file"
      echo "  ✓ Fixed: import { cn }"
    
    # Case 2: cn and other utils (e.g., formatCurrency)
    elif grep -q "import { cn, formatCurrency } from '@asym/lib/utils'" "$file"; then
      # Replace with two imports
      sed -i '' "s|import { cn, formatCurrency } from '@asym/lib/utils'|import { cn } from '@asym/ui/lib/utils';\nimport { formatCurrency } from '@asym/lib/utils'|g" "$file"
      echo "  ✓ Fixed: import { cn, formatCurrency }"
    
    elif grep -q "import { formatCurrency, cn } from '@asym/lib/utils'" "$file"; then
      # Replace with two imports (reverse order)
      sed -i '' "s|import { formatCurrency, cn } from '@asym/lib/utils'|import { cn } from '@asym/ui/lib/utils';\nimport { formatCurrency } from '@asym/lib/utils'|g" "$file"
      echo "  ✓ Fixed: import { formatCurrency, cn }"
    fi
  fi
}

# Fix donor app
echo ""
echo "=== Fixing donor app ==="
cd apps/donor
for file in $(grep -rl "cn.*from '@asym/lib/utils'" --include="*.tsx" --include="*.ts" .); do
  fix_file "$file"
done

# Fix missionary app
echo ""
echo "=== Fixing missionary app ==="
cd ../missionary
for file in $(grep -rl "cn.*from '@asym/lib/utils'" --include="*.tsx" --include="*.ts" .); do
  fix_file "$file"
done

cd ../..
echo ""
echo "✅ Done! Fixed cn imports in both apps."

