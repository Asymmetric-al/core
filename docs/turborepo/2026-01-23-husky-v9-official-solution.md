# Husky v9 - Official Solution for "Command Not Found" Errors

**Date:** 2026-01-23  
**Issue:** Git pre-commit hook failing with "command not found" errors  
**Solution:** Use Husky v9's official startup file approach (NOT PATH manipulation in hooks)

---

## ❌ The Problem

When committing, the husky pre-commit hook failed with:

```
npx: command not found
env: node: No such file or directory
```

**Root Cause:** Git hooks run with a limited PATH that doesn't include `/usr/local/bin` (where node/npm are installed) or `~/.bun/bin` (where bun is installed).

---

## ✅ The Official Husky v9 Solution

According to the [official Husky v9 documentation](https://typicode.github.io/husky/how-to.html#node-version-managers-and-guis), the correct approach is:

### 1. Keep Hook Files Minimal (Repository - Committed)

**`.husky/pre-commit`:**

```sh
npx lint-staged
```

That's it! No PATH manipulation, no shell profile sourcing, no complex logic in the hook file.

### 2. Create Startup File (Per-Developer - NOT Committed)

Each developer creates their own startup file at:

- **macOS/Linux:** `~/.config/husky/init.sh`
- **Windows:** `C:\Users\yourusername\.config\husky\init.sh`

**This file is NOT committed to the repository** - it's personal to each developer's machine.

Husky automatically sources this file before running any hook.

---

## Setup Instructions for Developers

### macOS Developers

```bash
# Create the directory
mkdir -p ~/.config/husky

# Choose ONE option based on your setup:

# Option 1: Homebrew Node
echo 'export PATH="/usr/local/bin:$PATH"' > ~/.config/husky/init.sh

# Option 2: nvm
cat > ~/.config/husky/init.sh << 'EOF'
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
EOF

# Option 3: bun
echo 'export PATH="$HOME/.bun/bin:$PATH"' > ~/.config/husky/init.sh

# Option 4: Fast .zshrc
echo '. ~/.zshrc' > ~/.config/husky/init.sh
```

### Linux Developers

```bash
mkdir -p ~/.config/husky
echo 'export PATH="/usr/local/bin:$PATH"' > ~/.config/husky/init.sh
```

### Windows Developers (Git Bash)

```bash
mkdir -p ~/.config/husky
echo 'export PATH="/c/Program Files/nodejs:$PATH"' > ~/.config/husky/init.sh
```

---

## Why This is the Best Approach

### ✅ Advantages

1. **Official Husky v9 solution** - Documented and supported
2. **Minimal hook files** - Easy to read and maintain
3. **Per-developer configuration** - Each developer sets up their own environment
4. **No repository pollution** - Startup file is NOT committed
5. **Works with all package managers** - npm, yarn, pnpm, bun
6. **Works with all version managers** - nvm, n, fnm, asdf, volta
7. **Cross-platform** - macOS, Linux, Windows
8. **Future-proof** - Husky will continue to support this approach

### ❌ Why Other Approaches Are Wrong

1. **❌ Sourcing shell profiles in hooks** - Causes errors, not cross-platform, pollutes repository
2. **❌ Hardcoding PATH in hooks** - Not portable, doesn't work for all developers
3. **❌ Using `bunx` or `npx` without PATH setup** - Chicken-and-egg problem

---

## Testing

After creating `~/.config/husky/init.sh`:

```bash
# Stage some files
git add .

# Try committing
git commit -m "test: verify husky hook works"
```

You should see lint-staged running successfully.

---

## Troubleshooting

### Hook still fails

1. **Verify the startup file exists:**

   ```bash
   cat ~/.config/husky/init.sh
   ```

2. **Check if node is in your PATH:**

   ```bash
   which node
   ```

3. **Test the startup file manually:**

   ```bash
   source ~/.config/husky/init.sh
   which node
   ```

4. **Add debug output:**
   ```sh
   # ~/.config/husky/init.sh
   echo "Husky init.sh loaded!"
   export PATH="/usr/local/bin:$PATH"
   ```

### Bypass hook temporarily

```bash
git commit -m "WIP" --no-verify
```

---

## References

- [Husky v9 - Node Version Managers and GUIs](https://typicode.github.io/husky/how-to.html#node-version-managers-and-guis)
- [Husky v9 - Startup Files](https://typicode.github.io/husky/how-to.html#startup-files)
- [Husky v9 - Troubleshooting](https://typicode.github.io/husky/troubleshoot.html)
