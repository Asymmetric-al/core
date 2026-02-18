#!/bin/bash

# Next.js 16 - Version Checker
# Verifies that all dependencies are compatible with Next.js 16

set -e

echo "🔍 Checking Next.js 16 compatibility..."
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if package.json exists
if [ ! -f "package.json" ]; then
  echo -e "${RED}❌ package.json not found${NC}"
  echo "Run this script from your project root directory."
  exit 1
fi

# Check Node.js version
echo "📦 Node.js Version:"
NODE_VERSION=$(node --version | cut -d'v' -f2)
NODE_MAJOR=$(echo $NODE_VERSION | cut -d'.' -f1)
NODE_MINOR=$(echo $NODE_VERSION | cut -d'.' -f2)

if [ "$NODE_MAJOR" -lt 20 ]; then
  echo -e "${RED}❌ Node.js $NODE_VERSION (requires 20.9+)${NC}"
  echo "   Upgrade: nvm install 20 && nvm use 20"
  exit 1
elif [ "$NODE_MAJOR" -eq 20 ] && [ "$NODE_MINOR" -lt 9 ]; then
  echo -e "${RED}❌ Node.js $NODE_VERSION (requires 20.9+)${NC}"
  echo "   Upgrade: nvm install 20 && nvm use 20"
  exit 1
else
  echo -e "${GREEN}✅ Node.js $NODE_VERSION${NC}"
fi

echo ""

# Check Next.js version
echo "🔧 Next.js Version:"
if [ -f "node_modules/next/package.json" ]; then
  NEXT_VERSION=$(node -p "require('./node_modules/next/package.json').version")
  NEXT_MAJOR=$(echo $NEXT_VERSION | cut -d'.' -f1)

  if [ "$NEXT_MAJOR" -lt 16 ]; then
    echo -e "${RED}❌ Next.js $NEXT_VERSION (requires 16.0.0+)${NC}"
    echo "   Upgrade: npm install next@16"
    exit 1
  else
    echo -e "${GREEN}✅ Next.js $NEXT_VERSION${NC}"
  fi
else
  echo -e "${YELLOW}⚠️  Next.js not installed (run npm install)${NC}"
fi

echo ""

# Check React version
echo "⚛️  React Version:"
if [ -f "node_modules/react/package.json" ]; then
  REACT_VERSION=$(node -p "require('./node_modules/react/package.json').version")
  REACT_MAJOR=$(echo $REACT_VERSION | cut -d'.' -f1)
  REACT_MINOR=$(echo $REACT_VERSION | cut -d'.' -f2)

  if [ "$REACT_MAJOR" -lt 19 ]; then
    echo -e "${RED}❌ React $REACT_VERSION (requires 19.2+)${NC}"
    echo "   Upgrade: npm install react@19.2 react-dom@19.2"
    exit 1
  elif [ "$REACT_MAJOR" -eq 19 ] && [ "$REACT_MINOR" -lt 2 ]; then
    echo -e "${YELLOW}⚠️  React $REACT_VERSION (recommends 19.2+)${NC}"
    echo "   Upgrade: npm install react@19.2 react-dom@19.2"
  else
    echo -e "${GREEN}✅ React $REACT_VERSION${NC}"
  fi
else
  echo -e "${YELLOW}⚠️  React not installed (run npm install)${NC}"
fi

echo ""

# Check TypeScript version (if using TypeScript)
if [ -f "tsconfig.json" ]; then
  echo "📘 TypeScript Version:"
  if [ -f "node_modules/typescript/package.json" ]; then
    TS_VERSION=$(node -p "require('./node_modules/typescript/package.json').version")
    TS_MAJOR=$(echo $TS_VERSION | cut -d'.' -f1)
    TS_MINOR=$(echo $TS_VERSION | cut -d'.' -f2)

    if [ "$TS_MAJOR" -lt 5 ]; then
      echo -e "${RED}❌ TypeScript $TS_VERSION (requires 5.1+)${NC}"
      echo "   Upgrade: npm install -D typescript@latest"
      exit 1
    elif [ "$TS_MAJOR" -eq 5 ] && [ "$TS_MINOR" -lt 1 ]; then
      echo -e "${RED}❌ TypeScript $TS_VERSION (requires 5.1+)${NC}"
      echo "   Upgrade: npm install -D typescript@latest"
      exit 1
    else
      echo -e "${GREEN}✅ TypeScript $TS_VERSION${NC}"
    fi
  else
    echo -e "${YELLOW}⚠️  TypeScript not installed (run npm install)${NC}"
  fi

  echo ""
fi

# Check for deprecated files
echo "🔎 Checking for deprecated patterns..."

DEPRECATED_FOUND=0

if [ -f "middleware.ts" ]; then
  echo -e "${YELLOW}⚠️  middleware.ts found (deprecated in Next.js 16)${NC}"
  echo "   Migrate: Rename to proxy.ts and update function name"
  DEPRECATED_FOUND=1
fi

if [ -f "middleware.js" ]; then
  echo -e "${YELLOW}⚠️  middleware.js found (deprecated in Next.js 16)${NC}"
  echo "   Migrate: Rename to proxy.js and update function name"
  DEPRECATED_FOUND=1
fi

# Check for parallel routes missing default.js
if [ -d "app" ]; then
  PARALLEL_ROUTES=$(find app -type d -name '@*' 2>/dev/null)

  if [ ! -z "$PARALLEL_ROUTES" ]; then
    for route in $PARALLEL_ROUTES; do
      if [ ! -f "$route/default.tsx" ] && [ ! -f "$route/default.jsx" ] && [ ! -f "$route/default.js" ]; then
        echo -e "${YELLOW}⚠️  $route missing default.tsx (required in Next.js 16)${NC}"
        echo "   Create: touch $route/default.tsx"
        DEPRECATED_FOUND=1
      fi
    done
  fi
fi

if [ $DEPRECATED_FOUND -eq 0 ]; then
  echo -e "${GREEN}✅ No deprecated patterns found${NC}"
fi

echo ""

# Summary
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📊 Summary:"
echo ""

ALL_GOOD=1

# Node.js check
if [ "$NODE_MAJOR" -ge 20 ] && [ "$NODE_MINOR" -ge 9 ]; then
  echo -e "${GREEN}✅ Node.js compatible${NC}"
else
  echo -e "${RED}❌ Node.js incompatible${NC}"
  ALL_GOOD=0
fi

# Next.js check
if [ -f "node_modules/next/package.json" ]; then
  if [ "$NEXT_MAJOR" -ge 16 ]; then
    echo -e "${GREEN}✅ Next.js compatible${NC}"
  else
    echo -e "${RED}❌ Next.js incompatible${NC}"
    ALL_GOOD=0
  fi
fi

# React check
if [ -f "node_modules/react/package.json" ]; then
  if [ "$REACT_MAJOR" -ge 19 ]; then
    echo -e "${GREEN}✅ React compatible${NC}"
  else
    echo -e "${RED}❌ React incompatible${NC}"
    ALL_GOOD=0
  fi
fi

# TypeScript check (if applicable)
if [ -f "tsconfig.json" ] && [ -f "node_modules/typescript/package.json" ]; then
  if [ "$TS_MAJOR" -ge 5 ] && [ "$TS_MINOR" -ge 1 ]; then
    echo -e "${GREEN}✅ TypeScript compatible${NC}"
  else
    echo -e "${RED}❌ TypeScript incompatible${NC}"
    ALL_GOOD=0
  fi
fi

echo ""

if [ $ALL_GOOD -eq 1 ] && [ $DEPRECATED_FOUND -eq 0 ]; then
  echo -e "${GREEN}🎉 All checks passed! Your project is ready for Next.js 16.${NC}"
  exit 0
elif [ $ALL_GOOD -eq 1 ]; then
  echo -e "${YELLOW}⚠️  Dependencies compatible, but deprecated patterns found.${NC}"
  echo "Fix deprecation warnings before migrating to Next.js 16."
  exit 1
else
  echo -e "${RED}❌ Compatibility issues found. Fix errors above before continuing.${NC}"
  exit 1
fi
