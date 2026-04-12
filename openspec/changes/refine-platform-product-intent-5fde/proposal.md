# Proposal: Refine platform product intent (delta only)

## Why

The merged `platform-product-intent` spec needs a durable “why” layer aligned
with current product truth: all-in-one ministry operations, donation integrity
first, CRM/CMS roles at the product level, unified four-area span, and strong
guardrails against generic SaaS drift. This change updates intent via OpenSpec
delta only; merged specs under `openspec/specs/` are not edited until archive
or an explicit merge step.

## What Changes

- Replace loose requirements with exactly seven named requirements (mission,
  unified span, audience tradeoffs, admin foundation, CRM/CMS truth, long-term
  success, non-goals).
- Encode the twelve product truths provided by stakeholders into requirement
  text and scenarios.
- Use GIVEN / WHEN / THEN scenario structure for future agent decision-making.

## What Does Not Change

- No edits to `openspec/specs/*` in this step.
- No architecture, routing, package, or technology detail in the delta.

## Expected Outcome

Agents planning or implementing work can read the merged product-intent spec
(after this delta is folded forward) and anchor on ministry-wide coherence,
donation trust, operational foundation, and CRM/CMS truth without a separate
product brief.
