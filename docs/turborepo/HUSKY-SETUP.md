# Husky Setup for Team Members

## Quick Start (One-Time Setup Per Machine)

If you're getting "command not found" errors when committing, you need to create a Husky startup file **once** on your machine.

### macOS/Linux

```bash
# Create the directory
mkdir -p ~/.config/husky

# Create the startup file (choose ONE based on your setup)

# If you installed Node via Homebrew (most common):
echo 'export PATH="/usr/local/bin:$PATH"' > ~/.config/husky/init.sh

# If you use nvm:
cat > ~/.config/husky/init.sh << 'EOF'
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
EOF

# If you use bun:
echo 'export PATH="$HOME/.bun/bin:$PATH"' > ~/.config/husky/init.sh
```

### Windows (Git Bash)

```bash
mkdir -p ~/.config/husky
echo 'export PATH="/c/Program Files/nodejs:$PATH"' > ~/.config/husky/init.sh
```

---

## Test It

```bash
# Stage some files
git add .

# Try committing
git commit -m "test: verify husky works"
```

You should see lint-staged running and checking your files.

---

## What This Does

- Husky automatically sources `~/.config/husky/init.sh` before running any git hook
- This file adds Node.js to your PATH so hooks can find `npx`, `node`, etc.
- This file is **NOT** committed to the repository - it's personal to your machine
- You only need to create this file **once per machine**, not per project

---

## Troubleshooting

### Still getting "command not found"?

1. Check if the file was created:

   ```bash
   cat ~/.config/husky/init.sh
   ```

2. Check where node is installed:

   ```bash
   which node
   ```

3. Update the init.sh file with the correct path

### Need to skip the hook temporarily?

```bash
git commit -m "WIP" --no-verify
```

---

## More Info

See `documents/turborepo/2026-01-23-husky-v9-official-solution.md` for the full explanation.
