#!/bin/bash
set -e

echo ""
echo "  ╭─────────────────────────────╮"
echo "  │     Nia Sync Engine         │"
echo "  ╰─────────────────────────────╯"
echo ""

# Check for pipx (preferred) or pip
if command -v pipx &> /dev/null; then
    echo "Installing via pipx..."
    pipx install nia-sync --force --quiet 2>/dev/null || pipx install nia-sync --force
elif command -v pip3 &> /dev/null; then
    echo "Installing via pip..."
    pip3 install --user --upgrade nia-sync --quiet 2>/dev/null || pip3 install --user --upgrade nia-sync --break-system-packages --quiet
else
    echo "✗ Python not found"
    echo "  Install pipx: brew install pipx"
    exit 1
fi

echo ""
echo "✓ Installed"
echo ""
echo "Get started:"
echo "  nia login    # authenticate"
echo "  nia status   # see sources"
echo "  nia          # start syncing"
echo ""
