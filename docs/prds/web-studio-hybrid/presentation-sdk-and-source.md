Planning contract reconciled on 2026-09-22. Read [package authority and checkpoints](README.md) and [owner amendments](adoption-map.md). Source-era evidence is dated; runtime qualification remains open.

<a id="web-developer-git"></a>

# Presentation SDK, ministry repository and delivery

<a id="web-h-developer-contract"></a>

## Developer contract

A ministry custom project is a conventional repository with TypeScript/TSX presentation code, CSS, declared local assets, a lockfile, tests, manifest, README and an example preview host. It is not the Core monorepo, a dump of CMS content or a folder of source strings in Payload. One starter project per independently maintained presentation project is the initial convention; multiple Sites in the same Tenant may explicitly consume qualified versions. A custom repository is unnecessary for a standard visual site.

Proposed package shape:

```text
ministry-site/
  package.json
  bun.lock
  asym.presentation.json
  src/renderers/
  src/styles/
  src/registry.ts
  assets/
  fixtures/             # synthetic or explicitly approved public-safe material
  tests/
  preview/              # versioned Asym preview host integration
  README.md
  MAINTENANCE.md
```

Do not require this exact folder spelling when existing repository conventions supply equivalent explicit entrypoints. The package root must be normalized and approved before source fetch. No symlink escape, arbitrary URL root, `.git` executable hooks or cross-repository path traversal. Initial intake rejects submodules and LFS-dependent bytes unless a separately qualified bounded fetch profile supports them. Do not silently omit those files and then call the build reproducible.

<a id="web-h-proposed-sdk-exports"></a>

## Proposed SDK exports

**Public types:** semantic content view models, typed qualified media/link references, exact locale context, public brand roles, renderer/setting manifest types.

**Pure helpers:** deterministic media markup, safe localized formatting where already owner-qualified, semantic source mapping for editor builds, pure layout helpers.

**Capability islands:** canonical give/form/navigation/dynamic-list handoff contracts where admitted. Islands do not expose raw internal clients or let a custom component choose payment/provider/recipient authority.

**Developer fixtures:** valid/empty/long/historical/localized/RTL/missing-media/no-JS/reduced-motion cases; editor-to-renderer binding assertions.

**Test helpers:** manifest validation, forbidden import graph, canonical-round-trip comparison and deterministic static rendering against the same supported public model.

No `@asym/api` server internals, Payload, Supabase, authentication clients, server secrets, shell/filesystem/process API, unrestricted network, server actions, arbitrary route handlers or direct operational writes. Pure third-party dependencies are eligible only through the package admission profile and complete transitive review.

<a id="web-h-registry-and-editable-bindings"></a>

### Registry and editable bindings

A registry entry binds a stable semantic type/version and renderer key to implementation and an exact finite settings schema. Public and editor builds share meaning, not necessarily identical JS bundles. Editor mapping emits document/node/field references only to authorized editing views. The trusted metadata importer treats the manifest as data; never execute a ministry registry merely to discover its schema in an admin request.

Changing filenames retains stable registry keys. Removing a required binding or changing its meaning requires an explicit compatibility/migration declaration. Test a representative altered field value through the actual render and check output; structural prop acceptance alone does not prove the field is visibly used. Dynamic or sophisticated code still requires human/independent review; no algorithm is claimed to recover every arbitrary React intention.

<a id="web-h-styles-fonts-and-javascript"></a>

### Styles, fonts and JavaScript

Use compiled scoped classes or an admitted stylesheet/module boundary. Never apply package CSS to the privileged editor shell. Fonts and assets have exact digests, declared origins/licenses and bounded loading behavior. External network origins, executable embeds and analytics are not silently introduced by source. Essential content and navigation render server-side without JavaScript; progressive enhancements honor reduced motion and fail accessibly. No scroll hijacking or fake loading delay.

Package server rendering is pure presentation over supplied public inputs. Public rendering does not fetch secrets or CRM records. An admitted package integrated into the managed runtime is reviewed first-party code, not a safely sandboxed arbitrary program. Static checks alone are not the security boundary; unreviewed code cannot enter that runtime. A future runtime for untrusted customer server code requires a separate architecture decision.

<a id="web-h-repository-connection-permissions"></a>

## Repository connection permissions

Prefer a GitHub App over permanent broad personal tokens. Request selected repository metadata/contents read and only required pull-request/status scopes; Checks write is optional and separate if feedback is shown in GitHub. No repository administration, workflow editing, secrets, organization membership enumeration, issue creation or source writes are required for the initial path. Installation tokens are narrowed and short-lived; treat format/length as opaque (E18).

Provider OAuth proves the connection's provider authorization, not a second Asym login. Verify both Asym current capability and the provider's installation/repository relationship. The callback's installation ID and posted repository URL cannot activate a binding by themselves (E17). Use server-held one-time expiring state tied to the initiating user/session and requested Asym scope; reject replay and mismatched return targets.

Webhook processing: authenticate exact raw bytes with HMAC; bound request size; validate provider event/action; resolve known installation/repository to an active scoped binding; commit accepted event identity and dispatch before returning success. Return within the documented ten-second bound, with an internal two-second p95 target. Unknown authenticated unrelated events are harmless no-ops; invalid signatures are rejected. Deduplicate by provider/app/delivery identity and by eventual business effect. Use current-state reconciliation because failed deliveries are not automatically redelivered. (E19–E21.)

<a id="web-h-source-intake-and-clean-build"></a>

## Source intake and clean build

1. Resolve the authorized source selector once to immutable commit/tree identity. Verify exact repository and approved package root. Retain commit plus content digests; branch names are discovery preferences.
2. Fetch source in a trusted ingestion environment holding only the narrowed provider credential. Produce a bounded, checked archive; record its digest and provenance.
3. Remove credential-bearing `.git` configuration and temporary secrets. Hand only source bytes and approved dependencies to the untrusted build environment. A `git clone` token left in origin config or environment is a defect.
4. Use the admitted toolchain image and frozen lock. Dependency acquisition follows a controlled registry route; prevent arbitrary postinstall egress, cloud metadata access and platform-private destinations. Namespace caches by trust/profile and verify cached bytes before reuse.
5. Run submitted developer tests for diagnostics, then independent platform-owned conformance/security/a11y/binding/locale/no-JS/hydration tests. The source cannot modify the latter oracle.
6. Record artifact digest, manifest, lock, toolchain, compiler, policies, evidence, maintainer and licenses. Compare independently repeated build output where reproducibility is required; differing digests need diagnosis rather than a misleading reproducible label.
7. Apply the existing admission decision. Publish no public head and write no CMS draft in the build worker.

<a id="web-h-deployment-and-managed-runtime-choice"></a>

## Deployment and managed runtime choice

Initial distribution uses **normal managed application build integration**: a release-controlled generated registry imports exact admitted immutable package versions and deploys the public runtime with required renderers available. No runtime `eval`, customer URL module, unsigned remote import or mutable package pointer.

This has a real tradeoff: adding custom executable code may require an Asym public-runtime code deployment. It does not mean every editorial update rebuilds Core. Keep old renderer versions required by active/retained generations until their retention proof permits removal. Public readers choose the exact generation-bound version. Version skew is a readiness failure, not permission to serve a different package.

Platform deployment configuration must prevent automatic production exposure from ministry Git integration. Vercel/other Git previews may help local developer review, but they are not the sealed Asym review candidate unless they meet its exact auth/content/artifact contract. No automatic per-Tenant hosting project or independently hosted frontend is introduced.

<a id="web-h-source-ownership-and-exit"></a>

## Source ownership and exit

The ministry retains repository administration and appoints maintainers. Record the rights Asym needs to build, serve and retain required artifacts, and the actual dependency/font/image licenses. Do not equate repository ownership with ownership of all dependencies or independent deployment of the whole Asym platform.

The handoff includes source setup, supported toolchain/SDK, declared component fields, test commands, deployment responsibilities, dependency update policy and a source/content/config export explanation. Routine source disconnection stops new source work but does not destroy compatible retained CMS behavior. Safety withdrawal, Site retirement and rights expiry have their own defined authority.

<a id="web-h-external-ai-coding"></a>

## External AI coding

External developers may use their chosen agent and provider account locally or in an approved development environment. Provide version-matched docs, fixtures and a development guide. No provider credential is needed in Asym for that path. Agent-generated source receives the same independent admission. Production content, operational records and private raw media must not be added to fixtures or prompts by convenience. Hosted OpenCode/BYOK and embedded IDE sessions remain separate future scope.

---
