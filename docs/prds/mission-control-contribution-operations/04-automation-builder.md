# PRD 4: Mission Control Automation Builder

**Current requirements amended 2026-09-22 (AL-1892).** The shared [Workflow Studio program contract](../workflow-studio/README.md) now governs the full authoring, execution-coordination and participant product. This document records the contribution-operations entry point into it. The [original PRD](https://github.com/Asymmetric-al/core/blob/7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd/docs/prds/mission-control-contribution-operations/04-automation-builder.md) preserves the earlier requirements and delivery history (split PRs #401 and #404); those claims do not establish implementation of the amended target. Existing [contribution owner contracts](../../features/mission-control/contribution-detail/README.md) retain business authority.

## Problem statement

Staff need both simple repeatable follow-up and longer processes involving tasks, evidence, branches and accountable people. Contribution operations, CRM, Support Hub, communications, CMS and missionary work must share those mechanisms while preserving each source’s protected decisions, permissions and recovery.

## Solution

Use the one Phase 34 Workflow Studio language, registry and operational history, with contextual contribution and Support entry points:

- **Simple mode** provides guided, plain-language trigger/condition/action rules.
- **Advanced mode** provides supported branches, waits, evidence requests, source-qualified reviews, roles and per-run amendments through the same versioned definition.
- **Managed by source** links to protected native processes and settings; it cannot turn a financial correction, approval, identity grant, publication or provider replay into a generic graph action.

The source-approved operation determines whether it can run automatically or requires human review. Review-first is an optional coordination pattern where permitted, not a replacement for the source’s approval contract. Resolve reviewers only to a currently eligible principal or source-approved queue; assignment and a task checkbox never grant approval authority. Protected review retains exact evidence, current capability and any required independence. Changed source evidence invalidates the affected reviewed action: prepare the source-supported successor/review or cancel it. Running an unchanged subset is allowed only when the exact source command and reviewed scope permit it.

Phase 12 controls distinct authoring, publication, activation and operation capabilities; `automation:manage` is a predecessor key rather than a substitute for current resolved access. Runtime actions use the existing single-Tenant NHI, its own grants and the active human owner’s live capability ceiling, with current source-purpose checks. Owner departure or capability loss stops affected future work.

Draft saving, immutable publication, enabling prospective enrollment and amending active runs are separate actions. Require source bindings, side-effect-free synthetic preview/test evidence, exact preflight and required review before activation. New optional starters remain disabled. Native receipts, recurring recovery, security, Support clocks and CMS publication/recovery continue without optional enrollment.

## Goals

- Preserve one typed declarative definition across guided, canvas and accessible outline editing; reject tenant scripts, raw SQL/HTTP and unsupported actions.
- Keep stable publications and active-run plan history; support source-qualified amendments, recovery and truthful unknown outcomes.
- Use shared tasks and source receipts without a second inbox or approval ledger.
- Invoke only the exact code-owned Phase 17 message producer binding and whole bounded plan occurrence through Phase 6; do not send directly or manufacture recipients, child intents or rendered content.
- Route allowed contribution coordination through the current contribution owner. Existing narrow correction/replay enums are migration inventory, not approved Studio action grants.
- Preserve source-semantic effect identities across native callers, workflows, retries and publication changes; use the established product claims/outbox/executor contract.
- Deliver Phase 34 CORE independently with real non-mobilization tracers. Phase 35 owns DON-01–DON-13 and MPD-01/MPD-06; development DON-14–DON-16 stays in CORE. Applications, events and care retain their Phase 41/37/38 owners.

## Out of scope

Arbitrary user code, external integration marketplace, replacement source ledgers or permission systems, parallel rule engines, provider replay shortcuts and reopening ratified financial policy. This planning amendment does not implement or activate the Studio or claim that the current dashboard already supports it.

## Testing decisions

Use the [352-scenario acceptance catalog](../workflow-studio/10-acceptance-scenarios.md) and applicable source-owner tests. For this entry point prove current Phase 12/NHI and source authorization, separate draft/publication/activation, safe synthetic preview, blocked unsupported actions, source-qualified reviewer selection, stale evidence handling, immutable prepared messages, native/Studio deduplication and uncertain-outcome recovery. Preserve exact reasons and audit evidence for source-supported subset, regenerate-review and cancellation paths; do not infer them from a generic run mode.

Inventory existing rules and retained activity before migration. Compare old/new evaluation with effects disabled, preserve semantic identities and route compatibility, and select one execution owner before enabling new behavior. No old/new evaluator may independently create the same effect.

## Definition of done

The assigned source-capable slices of the shared program pass their actual implementation, database, adapter, privacy, accessibility and operational gates. Staff can configure permitted follow-up through this contextual entry point while source authority remains intact. Source requirements, qualified providers, complete checkpoint evidence and deliberate tenant enablement remain separate facts. Documentation adoption or a passing fixture parser does not complete those gates.
