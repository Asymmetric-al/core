# Documentation

Welcome to the Asymmetric.al Core documentation! This directory contains all project documentation organized by category.

---

## 📁 Directory Structure

### `guides/` - Developer Guides

Organized documentation for developers working on this project:

#### **Architecture**

- **[Architecture Overview](./guides/architecture/overview.md)** - System architecture, monorepo structure, and design patterns
- **[Technical Decisions](./guides/architecture/technical-decisions.md)** - Key technical decisions and their rationale

#### **Development**

- **[Getting Started](./guides/development/getting-started.md)** - Development setup, workflow, and best practices
- **[Contributing Guide](./guides/development/contributing.md)** - How to contribute to the project
- **[Mock Data Guide](./guides/development/mock-data.md)** - Working with mock data and seeding
- **[TanStack Integration](./guides/development/tanstack-integration.md)** - TanStack Table and Query integration guide
- **[MCP Config Example](./guides/development/mcp-config.example.toml)** - Model Context Protocol configuration template

#### **Features**

- **[Email Studio](./guides/features/email-studio.md)** - Unlayer email editor integration and setup
- **[PDF Studio](./guides/features/pdf-studio.md)** - Document/PDF editor for receipts and statements
- **[Care Hub](./guides/features/care-hub.md)** - Member care and personnel management
- **[Teams & Permissions](./guides/features/teams-and-permissions.md)** - Access control and team management
- **[SendGrid Integration](./guides/features/sendgrid-integration.md)** - Email delivery service integration

#### **UI & Design**

- **[Component Inventory](./guides/ui-design/component-inventory.md)** - Complete inventory of UI components
- **[Component Sources](./guides/ui-design/component-sources.md)** - Component sources and design system
- **[Responsive Design](./guides/ui-design/responsive-design.md)** - Responsive design patterns and breakpoints
- **[Icons Guide](./guides/ui-design/icons.md)** - Icon system and usage
- **[PWA Icons](./guides/ui-design/pwa-icons.md)** - Progressive Web App icon configuration

---

### `summary/` - Task Summaries & Migration Docs

AI-generated documentation following the naming convention `YYYY-MM-DD-HH-MM_{short_detail}.md`:

- **`turborepo/`** - Turborepo migration documentation and compliance audits

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

1. Start with **[Getting Started Guide](./guides/development/getting-started.md)**
2. Read **[Architecture Overview](./guides/architecture/overview.md)** for system overview
3. Review **[Contributing Guide](./guides/development/contributing.md)** for workflow
4. Check **[Features](./guides/features/)** for module-specific documentation

### For Contributors

1. Read **[Contributing Guide](./guides/development/contributing.md)**
2. Follow the **[Technical Decisions](./guides/architecture/technical-decisions.md)** for context
3. Check **[Component Inventory](./guides/ui-design/component-inventory.md)** before creating new UI

### For Feature Setup

1. **Email/PDF Studio:** See **[Email Studio](./guides/features/email-studio.md)** or **[PDF Studio](./guides/features/pdf-studio.md)**
2. **SendGrid:** See **[SendGrid Integration](./guides/features/sendgrid-integration.md)**
3. **Teams:** See **[Teams & Permissions](./guides/features/teams-and-permissions.md)**

---

## 📝 Documentation Standards

- All documentation is written in Markdown
- Use clear, concise language
- Include code examples where appropriate
- Keep documentation up-to-date with code changes
- Follow the **[Contributing Guide](./guides/development/contributing.md)** for documentation contributions
- **AI-generated docs:** Follow naming convention `YYYY-MM-DD-HH-MM_{short_detail}.md` in `docs/summary/{feature}/`

---

## 🔗 External Resources

- **[Next.js Documentation](https://nextjs.org/docs)** - Next.js framework
- **[Turborepo Documentation](https://turbo.build/repo/docs)** - Monorepo build system
- **[Supabase Documentation](https://supabase.com/docs)** - Backend and database
- **[shadcn/ui Documentation](https://ui.shadcn.com)** - UI component library

---

**Last Updated:** 2026-01-23

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
