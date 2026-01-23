# Documentation

Welcome to the Asymmetric.al Core documentation! This directory contains all project documentation organized by category.

---

## 📁 Directory Structure

### `guides/` - Developer Guides

Core documentation for developers working on this project:

- **`developer-guide.md`** - Main developer onboarding guide
- **`contributing.md`** - Contribution guidelines and workflow
- **`architecture.md`** - System architecture overview
- **`technical-decisions.md`** - Technical decision records (TDRs)
- **`mock-data.md`** - Mock data and seeding guide

**UI/Design:**

- **`responsive-design.md`** - Responsive design patterns
- **`pwa-icons.md`** - PWA icon setup and guidelines
- **`icons.md`** - Icon system documentation
- **`ui-inventory.md`** - UI component inventory
- **`ui-sources.md`** - UI component sources and references

**Integrations:**

- **`tanstack-integration.md`** - TanStack Query/Table integration
- **`mcp-config.example.toml`** - MCP configuration example

---

### `modules/` - Feature Modules

Documentation for specific feature modules:

- **`care-hub.md`** - Care Hub feature documentation
- **`email-studio.md`** - Email Studio feature
- **`pdf-studio.md`** - PDF Studio feature
- **`sendgrid-integration.md`** - SendGrid email integration
- **`teams-and-permissions.md`** - Teams and permissions system

---

### `turborepo/` - Turborepo Migration

Documentation for the Turborepo monorepo migration:

- **`README.md`** - Turborepo overview
- **`MIGRATION-COMPLETE.md`** - Migration summary
- **`HUSKY-SETUP.md`** - Husky git hooks setup
- **`HUSKY-TEAM-ONBOARDING.md`** - Team onboarding for Husky

**Phase Documentation:**

- Phase 1-4 completion docs
- Migration plans and checklists
- Audit and quick reference guides

---

### `refactorturbo/` - Legacy Migration Docs

Historical documentation from the initial Turborepo migration (archived):

- Phase 1-9 completion docs
- Architecture comparisons
- Progress reviews

**Note:** This is legacy documentation. See `turborepo/` for current migration docs.

---

### `ai/` - AI Assistant Configuration

Configuration and rules for AI coding assistants:

- **`rules/`** - AI agent rules (general, frontend, backend, testing)
- **`skills/`** - AI agent skills for specific technologies
- **`stack-registry.md`** - Technology stack registry
- **`working-set.md`** - Current work context

**See:** `AGENTS.md` in the root for the AI agent router.

---

## 🚀 Quick Start

### For New Developers

1. Start with **`guides/developer-guide.md`**
2. Read **`guides/architecture.md`** for system overview
3. Review **`guides/contributing.md`** for workflow
4. Check **`turborepo/README.md`** for monorepo structure

### For Feature Development

1. Check **`modules/`** for feature-specific docs
2. Review **`guides/ui-inventory.md`** for available components
3. See **`guides/technical-decisions.md`** for patterns

### For AI Assistants

1. See **`AGENTS.md`** in root for routing
2. Load rules from **`ai/rules/`** based on task
3. Load skills from **`ai/skills/`** for specific technologies

---

## 📝 Documentation Standards

### File Naming

- Use lowercase with hyphens: `developer-guide.md`
- Date-prefixed for historical docs: `2026-01-23-phase-1-complete.md`
- Clear, descriptive names

### Structure

- Start with a clear title and purpose
- Include table of contents for long docs
- Use headings for organization
- Include code examples where relevant
- Add links to related docs

### Maintenance

- Keep docs up-to-date with code changes
- Archive outdated docs in appropriate subdirectories
- Update this README when adding new categories

---

## 🔗 Related Documentation

- **Root README.md** - Project overview and quick start
- **AGENTS.md** - AI agent router and rules
- **CONTRIBUTING.md** - Contribution guidelines (also in `guides/`)

---

**Last Updated:** 2026-01-23
