# Prepare ReUI Pro for repository agents

## Why

Core will use ReUI heavily. Its existing skill assumes anonymous MCP access and
an obsolete skill installer. Current ReUI requires authentication, serves a new
shared skill bundle, and selects component APIs and plans from request context.
Agents need a working Pro workflow that preserves Core's shared Base UI system.

## What Changes

- Vendor the complete current official ReUI skill with Core-specific overlays
  and source provenance, then generate the three supported client mirrors.
- Configure authenticated MCP requests using the existing runtime license and
  exact `base-maia` context for Codex, Claude Code, and Cursor.
- Document current Markdown documentation discovery through `llms.txt`, Pro
  block selection, registry installation, and package-owned adaptation.
- Add a read-only readiness command and a staged skill-refresh command.

## Capabilities

- `agent-instruction-system`: ReUI skill ownership, authenticated tool routing,
  documentation discovery, and verification.

## Scope and Non-goals

This change owns agent skills, MCP configuration, setup documentation, focused
maintenance scripts and tests. It does not migrate existing product UI, replace
shared primitives or tables, change package dependencies, add Ultimate-only
content, publish a deployment, or store credentials in Git.

## Rollback

Revert this change's canonical skills, mirrors, configurations, and commands
together. Refresh staging and readiness checks make no product writes.
