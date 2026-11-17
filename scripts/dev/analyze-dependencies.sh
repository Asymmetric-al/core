#!/bin/bash

# Analyze which packages use which dependencies
# Output: one sorted text file of external import specifiers per package/app in
# .turbo/analysis/<name>-imports.txt, then the 20 most common across all of them.

echo "🔍 Analyzing dependency usage across packages..."
echo ""

mkdir -p .turbo/analysis

analyze_package() {
  local package_path=$1
  local package_name=$(basename "$package_path")
  
  echo "📦 Analyzing $package_name..."
  
  # Find all import statements
  # Look for: import ... from 'package-name'
  # Look for: require('package-name')
  
  find "$package_path" -type f \( -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx" \) \
    -not -path "*/node_modules/*" \
    -not -path "*/.next/*" \
    -not -path "*/dist/*" \
    -exec grep -h -E "(import .* from ['\"]|require\(['\"])" {} \; 2>/dev/null \
    | grep -v "^//" \
    | grep -v "^\s*//" \
    | sed -E "s/.*from ['\"]([^'\"]+)['\"].*/\1/" \
    | sed -E "s/.*require\(['\"]([^'\"]+)['\"].*/\1/" \
    | grep -v "^@asym/" \
    | grep -v "^\." \
    | grep -v "^~" \
    | grep -v "^/" \
    | sort -u \
    > ".turbo/analysis/${package_name}-imports.txt"
  
  echo "  Found $(wc -l < .turbo/analysis/${package_name}-imports.txt | tr -d ' ') unique imports"
}

for pkg in packages/*; do
  if [ -d "$pkg" ]; then
    analyze_package "$pkg"
  fi
done

for app in apps/*; do
  if [ -d "$app" ]; then
    analyze_package "$app"
  fi
done

echo ""
echo "✅ Analysis complete! Results in .turbo/analysis/"
echo ""
echo "📊 Summary:"
echo ""

echo "Most commonly used dependencies:"
cat .turbo/analysis/*-imports.txt | sort | uniq -c | sort -rn | head -20

echo ""
echo "📁 Detailed results:"
ls -lh .turbo/analysis/

