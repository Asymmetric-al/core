# Husky Setup - Team Onboarding Guide

## What Happens When New Developers Join

### ✅ The Good News

**Husky WILL work for all developers** - they just need a **one-time setup** on their machine.

### 📋 Developer Experience

```
1. Clone repo
   ↓
2. Run `bun install`
   ↓
3. Husky installs automatically (via prepare script)
   ↓
4. Try to commit
   ↓
5. ❌ "command not found" error
   ↓
6. Create ~/.config/husky/init.sh (ONE TIME)
   ↓
7. Try to commit again
   ↓
8. ✅ Works forever!
```

---

## Why This Approach?

### The Official Husky v9 Way

This is the **official solution** from Husky v9 documentation:

- **Hook files stay minimal** (just `npx lint-staged`)
- **Each developer configures their own environment** via `~/.config/husky/init.sh`
- **Not committed to repo** - personal to each machine
- **Works across all projects** - one-time setup per machine, not per project

### Benefits

✅ **Cross-platform** - macOS, Linux, Windows  
✅ **Works with all package managers** - npm, yarn, pnpm, bun  
✅ **Works with all version managers** - nvm, n, fnm, asdf, volta  
✅ **Minimal repository code** - no complex PATH logic in hooks  
✅ **Future-proof** - official Husky approach

---

## Setup Instructions (For Developers)

### macOS/Linux

```bash
mkdir -p ~/.config/husky
echo 'export PATH="/usr/local/bin:$PATH"' > ~/.config/husky/init.sh
```

### Windows (Git Bash)

```bash
mkdir -p ~/.config/husky
echo 'export PATH="/c/Program Files/nodejs:$PATH"' > ~/.config/husky/init.sh
```

### Using nvm?

```bash
mkdir -p ~/.config/husky
cat > ~/.config/husky/init.sh << 'EOF'
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
EOF
```

### Using bun?

```bash
mkdir -p ~/.config/husky
echo 'export PATH="$HOME/.bun/bin:$PATH"' > ~/.config/husky/init.sh
```

---

## Communication Strategy

### In README.md

✅ **Already added** - See the "Git Hooks (Husky)" section in README.md

### In Onboarding Docs

Add this to your team onboarding checklist:

```markdown
- [ ] Clone repository
- [ ] Run `bun install`
- [ ] Set up environment variables (.env.local)
- [ ] **Set up Husky** (see README.md "Git Hooks" section)
- [ ] Test commit to verify hooks work
```

### In Slack/Discord

When someone reports "command not found" errors:

> Hey! You need to do a one-time Husky setup. Run this:
>
> ```bash
> mkdir -p ~/.config/husky
> echo 'export PATH="/usr/local/bin:$PATH"' > ~/.config/husky/init.sh
> ```
>
> See the README.md "Git Hooks (Husky)" section for details.

---

## FAQ

### Q: Why not just fix it in the hook file?

**A:** That's not the official Husky v9 approach. Hardcoding PATH in hooks:

- Doesn't work for all developers (different Node install locations)
- Doesn't work with version managers (nvm, fnm, etc.)
- Pollutes the repository with environment-specific code

### Q: Can we automate this setup?

**A:** Not easily. The `~/.config/husky/init.sh` file is outside the repository and requires different content for different setups (Homebrew vs nvm vs bun, etc.). It's better to document it clearly.

### Q: What if a developer doesn't set this up?

**A:** They can still commit using `git commit --no-verify`, but they'll bypass the linting checks. The CI will catch any issues.

### Q: Do they need to do this for every project?

**A:** No! Once `~/.config/husky/init.sh` is created, it works for **all projects** that use Husky on that machine.

---

## Monitoring

### How to know if developers are having issues:

1. **Watch for commits with `--no-verify`** in commit messages
2. **Check CI failures** for linting errors (means hooks were bypassed)
3. **Ask in standup** if anyone had issues with git hooks

---

## References

- [Husky v9 Official Docs](https://typicode.github.io/husky/)
- [HUSKY-SETUP.md](./HUSKY-SETUP.md) - Quick setup guide
- [2026-01-23-husky-v9-official-solution.md](./2026-01-23-husky-v9-official-solution.md) - Full explanation
