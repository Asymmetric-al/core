# 1. Workflow Studio — scope, authority, and decisions

**Planning integration:** 2026-09-22 (AL-1892). Original specification version 1.0.0; research captured September 12, 2026.

**Target:** Phase 34 shared Workflow Studio (57 recipes), Phase 41 Mobilization (12), Phase 35 Giving (15), Phase 37 Events (3), and Phase 38 Care (9). CORE qualifies independently. Phase 41 follows CORE as the prioritized mobilization lane; neither phase numbering nor FULL evidence adds a reverse dependency. See [delivery contracts](contracts/delivery-plan.json).

**Baseline reviewed:** `develop` at `7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd`.

**Status:** integrated planning contract from the user-supplied September 22 roadmap. Program ownership and intended outcomes are adopted here; provider qualification, exact new schemas/capability keys and unresolved source bindings remain explicit implementation gates, not certified decisions. No runtime, deployment or activation is implied. Existing accepted source owners remain binding. The original packet is [immutable evidence](../program-roadmap/source-2026-09-22/README.md); the effective [integration guide](../program-roadmap/integration-guide.md) and this reconciled package remove conflicts in the operative bodies. Research references in [chapter 11](11-research-and-repository-evidence.md) describe the original captured baseline.

## Product promise

Tenant staff can define what happens, who is responsible, what information is collected, who receives it, when work is due, and what evidence permits a process to continue. The same process appears as operational work in Mission Control and as an appropriate next action for each participant. A simple automation and a year-long application use one governed model, not separate engines.

## Users and minimum outcomes

| Persona                                          | First useful outcome                                                | Required experience                                                                 |
| ------------------------------------------------ | ------------------------------------------------------------------- | ----------------------------------------------------------------------------------- |
| Tenant administrator / operations lead           | Publish a shared template, delegate safe edits, find stalled work   | Library, editor, publication history, run operations, scoped administration         |
| Small-team generalist                            | Change an owner, reminder, form, or handoff without code            | Guided starter, sentence-style configuration, clear defaults and fallback queue     |
| Donor services / development                     | Follow up on gifts, requests, commitments, and relationships        | Coordinated donor-care recipes and shared CRM tasks                                 |
| Mobilization coordinator / interviewer / trainer | Complete inquiry through onboarding, with exceptions                | Stages, references, evidence, participant tasks, per-case revisions                 |
| Finance                                          | Configure permitted operational follow-up without losing controls   | Protected domain-process blocks and native settings, never arbitrary approval logic |
| Missionary / coach                               | Receive useful support-raising and coaching work                    | My Work, permission-scoped supporter views, no administrative builder by default    |
| Communications / web staff                       | Coordinate drafting, review, translation, publication, distribution | Exact revision review, publication evidence, message and audience ownership         |
| Member-care staff                                | Coordinate care without revealing its existence to ordinary staff   | Sealed run scope, restricted projections, protected audit and alerts                |

Applicants, external references, donors, partners, and trainees are participants, not additional administrator roles. A person can have several independently authorized roles in a tenant. A spouse, teammate, coach, or CRM relationship receives no automatic access.

## Three customization envelopes

1. **Designed processes:** tenant-authored steps, forms, branching, roles, dependencies, bounded timing, and permitted operations. Mobilization is a Phase 41 consumer of these shared Phase 34 mechanisms.
2. **Configured automations:** approved events and actions with editable conditions, recipients, templates, thresholds, timing, and follow-up. Gift stewardship is an example.
3. **Protected processes:** native, source-owned settings and explicit coordination hooks. Expense approval, receipt correction, payment recovery, identity verification, publication restrictions, and records disposal cannot be reimplemented in the Studio.

One library exposes all three through honest labels: **Editable workflow**, **Automation**, or **Managed by [product]**. Protected blocks open their owning settings or commands; they do not copy those settings into a second authority. Core's current roadmap already requires this separation [R3, R4].

## Design direction and qualification boundaries

| ID  | Decision                                                                                                                                                                                      | Reason / consequence                                                                                                                                      |
| --- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| D01 | Inngest is the preferred durable executor; Postgres owns process records                                                                                                                      | Aligns with existing Core orchestration authority [R3]                                                                                                    |
| D02 | Use `@xyflow/react` directly, not Workflow Kit as the product engine                                                                                                                          | Workflow Kit describes itself as a reference implementation [R8]                                                                                          |
| D03 | A versioned structured workflow language is canonical; the diagram is a view                                                                                                                  | Prevents arbitrary graph topology and coordinates from deciding business behavior                                                                         |
| D04 | Use typed if/then conditions, explicit branching, durable waits, and evidence contracts                                                                                                       | Conditional rules alone cannot represent human work or prove completion                                                                                   |
| D05 | Shared coded action registry; no tenant JavaScript, SQL, raw HTTP, or credential entry                                                                                                        | Keeps domain and permission boundaries enforceable                                                                                                        |
| D06 | Published definitions are immutable; active runs pin a version                                                                                                                                | New publications never silently rewrite active journeys                                                                                                   |
| D07 | Explicit per-run revision and controlled migration are launch requirements                                                                                                                    | Applicants need legitimate variation without corrupting history                                                                                           |
| D08 | Shared tasks, forms, messages, files, and domain records; no second inbox or ledger                                                                                                           | Preserves Core ownership and connected experiences                                                                                                        |
| D09 | Prospective triggers by default; historical import and replay are side-effect-dark                                                                                                            | Prevents retroactive emails, grants, welcomes, and financial effects                                                                                      |
| D10 | Task result, evidence result, communication result, and process result are separate                                                                                                           | A completed checkbox is not payment, approval, signature, or publication                                                                                  |
| D11 | The existing Phase 12 single-Tenant NHI authorizes runtime actions only within its own grants and its active human owner’s current resolved capabilities; current PDP checks remain mandatory | Publication is no grant; departure or loss of the human owner’s required capability stops affected future work. Transfer requires current reauthorization |
| D12 | External side effects have product-owned permanent semantic identities                                                                                                                        | Provider deduplication windows are not long-term business guarantees [S05, S06]                                                                           |
| D13 | Long-lived engagements advance through bounded Inngest executions                                                                                                                             | Provider run length and trace retention never define applicant lifetime [S04]                                                                             |
| D14 | Exact `base-maia`, Base UI primitives, shared semantic tokens                                                                                                                                 | Existing repository UI constitution [R1]                                                                                                                  |
| D15 | Core common starter defaults ship; optional workflows require deliberate activation                                                                                                           | Essential giving, access, and domain recovery never require custom workflow setup                                                                         |
| D16 | Review-first, not fully autonomous AI                                                                                                                                                         | AI may draft and explain; it cannot widen scope, approve money, or publish by inference                                                                   |
| D17 | One central workflow catalog with contextual module entry points                                                                                                                              | Support Hub and contribution packs do not grow parallel builders                                                                                          |
| D18 | No arbitrary percentage progress for complex work                                                                                                                                             | Show explicit milestones, evidence, next action, and separately reported outcomes                                                                         |

## In scope

The complete authoring lifecycle; typed data selection and forms; named role bindings; task and evidence orchestration; contextual and participant projections; per-run modifications; communication coordination; event and action registry; domain adapters; durable execution and recovery; operational controls; simulation; tenant isolation; source-aware reporting; safe template portability; a comprehensive recipe catalog and concrete reference definitions.

## Non-goals

A general iPaaS marketplace; free-form scripting; a replacement CRM, CMS, email platform, accounting engine, payment processor, payroll engine, clinical record system, or document repository; child sponsorship; Asym's SaaS billing; cross-tenant data sharing; collaborative CRDT editing at launch; arbitrary freehand loops; a new app for each participant role; automatic deployment of tenant-generated code; autonomous AI approval.

## Delivery model and readiness

The Studio foundation is built once. Each recipe is **specified**, then **adapter-certified**, then **tenant-ready**, then **published**, then **enabled**. These are different facts. An installed feature with missing required source authority cannot be enabled. Optional, disabled, or unauthorized care and finance modules must leave no empty cards or existence signals in ordinary surfaces.

Delivery waves are not a renumbering of the roadmap. Hard owning-phase dependencies remain. A change to a phase title, dependency, or boundary must update the source roadmap and its mirrors in the same repository change. No previously ratified financial rule is reopened implicitly.

## Definition of done

Completion requires merged implementation, applicable repository checks, source adapter certifications, tenant/security tests, production-shaped failure drills, accessible participant experiences, documented support procedures, and a controlled pilot. Parsing the supplied JSON, finishing a diagram, or passing a mocked happy path is insufficient.
