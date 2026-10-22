# Agent Skills Maintenance Log

Last updated: 2026-10-22

<!-- AL-2186-AUDIT-START -->

## Current installed-skill audit - 2026-10-22 (AL-2186)

Baseline: c4d36cb029121641b8882237632d0d6da434049e on develop. This baseline already contains
the public-v4 Payload adapters; retired names were not restored.

- Canonical skills: **134**; discoverable runtime skills: **190** per client; lock entries: **150**.
- Counts use actual SKILL.md entrypoints; directories without entrypoints are excluded.
- skills:sync writes mirrors; skills:verify renders expected output in scratch and compares without changing tracked files.
- [skill-source-audit.json](skill-source-audit.json) accounts for every installed source, per-skill review evidence, hash, adaptation and notice inventory. Unknown imported revisions remain null rather than inferred.
- Raw, legacy lock, final entrypoint and complete payload hashes are recorded separately. Current means reviewed comparison or an applicable Core installed-contract adapter; it does not imply latest product adoption, live-provider validation or a security audit run.
- Cloudflare retains guidance by default and explicit full-audit activation. Refresh copies/formats reviewed source without executing imported code.
- Twenty newly attributed skills remain ecosystem-owned under .agents/skills; persistent adapters restore policies, invocation metadata and example fixes.
- PDF is excluded pending owner license review. All twelve files in each runtime tree are checked against immutable baseline hashes. Global installs are untouched.
- Retained, unresolved and excluded sources carry no upstream-freshness claim. Missing applicable permission is recorded as unknown, not as prohibited.

Outcomes: 80 updated, 89 current, 12 retained-snapshot, 8 unresolved, 1 excluded.

### Per-skill outcome

| Skill                              | Outcome           | Source                                                            | Imported revision or content hash                                | Core adaptations                                                                                                                                                                                                                       |
| ---------------------------------- | ----------------- | ----------------------------------------------------------------- | ---------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| accessibility-review               | current           | Asymmetric-al/core                                                | 196b083e8e2440676a69d17af19d2ab4e2df628fe47b753d29b9cb26e1fd8675 | Retain repository-owned installed-contract guidance; upstream inspiration is lineage and does not imply imported or latest upstream content.                                                                                           |
| agent-browser                      | current           | vercel-labs/agent-browser                                         | 3a7520e64de2dfaa516b6721c001e84e06e3c06a187b82af029ae721540ebfac | Complete installed payload matches reviewed source after repository formatting; local provenance or Core sync notes are retained.                                                                                                      |
| agent-email-inbox                  | updated           | resend/resend-skills                                              | b2ae7b1798b70134faf679f35fc05b4331462988                         | Reviewed immutable source with existing Core compatibility preserved.                                                                                                                                                                  |
| anim                               | current           | Asymmetric-al/core                                                | 7757c7cfb791664cedfc44d556e5c9476b664e75e14bf04cb056de2ce7230c29 | Retain repository-owned installed-contract guidance; upstream inspiration is lineage and does not imply imported or latest upstream content.                                                                                           |
| animate                            | updated           | emilkowalski/skills                                               | 2d228630ba1446365f614a108cb8252f1feda202                         | Existing discovery metadata and explicit-only flags preserved; Existing marked Core overlays and compatibility corrections retained; Refresh does not execute imported scripts/assets; explicit synthetic tests validate reviewed h... |
| animate-expo                       | updated           | emilkowalski/skills                                               | 2d228630ba1446365f614a108cb8252f1feda202                         | Existing discovery metadata and explicit-only flags preserved; Existing marked Core overlays and compatibility corrections retained; Refresh does not execute imported scripts/assets; explicit synthetic tests validate reviewed h... |
| animation-vocabulary               | updated           | emilkowalski/skills                                               | 2d228630ba1446365f614a108cb8252f1feda202                         | Existing discovery metadata and explicit-only flags preserved; Existing marked Core overlays and compatibility corrections retained; Refresh does not execute imported scripts/assets; explicit synthetic tests validate reviewed h... |
| api-design-principles              | updated           | wshobson/agents                                                   | 0874a27b17a22e2b7c2e2bcd725768e0803cad06                         | Preserved Core HTTPException.detail type guard in the Python template.; Added marked Core applicability, ecosystem ownership, and non-executing maintenance overlay.; Normalized Markdown trailing whitespace and final newlines; r... |
| apple-design                       | updated           | emilkowalski/skills                                               | 2d228630ba1446365f614a108cb8252f1feda202                         | Existing discovery metadata and explicit-only flags preserved; Existing marked Core overlays and compatibility corrections retained; Refresh does not execute imported scripts/assets; explicit synthetic tests validate reviewed h... |
| architecture-patterns              | updated           | wshobson/agents                                                   | 0874a27b17a22e2b7c2e2bcd725768e0803cad06                         | Added marked Core applicability, ecosystem ownership, and non-executing maintenance overlay.; Normalized Markdown trailing whitespace and final newlines; retained hard breaks without trailing spaces.; Registered the reviewed co... |
| ask-matt                           | updated           | mattpocock/skills                                                 | 5beb35b040e3de97e54fa9e386d7e42d15c295c2                         | Existing discovery metadata and explicit-only flags preserved; Existing marked Core overlays and compatibility corrections retained; Refresh does not execute imported scripts/assets; explicit synthetic tests validate reviewed h... |
| ask-sonner                         | updated           | emilkowalski/skills                                               | 2d228630ba1446365f614a108cb8252f1feda202                         | Existing discovery metadata and explicit-only flags preserved; Existing marked Core overlays and compatibility corrections retained; Refresh does not execute imported scripts/assets; explicit synthetic tests validate reviewed h... |
| babysit                            | unresolved        | a5c-ai/babysitter-cursor                                          | 532d534cc1ec6f83e10a4bf6a00ebefddea348e85ed80b88e1703612fdd68de5 | Retain Core exact SDK pin, no global install/fallback, noninteractive same-turn Cursor loop.                                                                                                                                           |
| base-ui                            | current           | Asymmetric-al/core                                                | 6e9525578f11f859c329e81efaaa5a7fe4e8aa73eaf7b6ea8937c8b07e66b4c2 | Retain repository-owned installed-contract guidance; upstream inspiration is lineage and does not imply imported or latest upstream content.                                                                                           |
| bats-testing-patterns              | updated           | wshobson/agents                                                   | 0874a27b17a22e2b7c2e2bcd725768e0803cad06                         | Added marked Core applicability, ecosystem ownership, and non-executing maintenance overlay.; Normalized Markdown trailing whitespace and final newlines; retained hard breaks without trailing spaces.; Registered the reviewed co... |
| bendc-frontend-guidelines          | unresolved        | bendc/frontend-guidelines                                         | dce7f954340cbde9e995ed087bd786f7c9ad28947090d1b3b8de956d2da1d399 | Retain existing Core wrapper and vendored historical README; no applicable license found in the current README-only source tree.                                                                                                       |
| better-accessibility               | updated           | jakubkrehel/skills                                                | 4c66b1fa86e9ab70187b43d7da9b6fdb29f2ef63                         | Existing discovery metadata and explicit-only flags preserved; Existing marked Core overlays and compatibility corrections retained; Refresh does not execute imported scripts/assets; explicit synthetic tests validate reviewed h... |
| better-colors                      | updated           | jakubkrehel/skills                                                | 4c66b1fa86e9ab70187b43d7da9b6fdb29f2ef63                         | Existing discovery metadata and explicit-only flags preserved; Existing marked Core overlays and compatibility corrections retained; Refresh does not execute imported scripts/assets; explicit synthetic tests validate reviewed h... |
| better-forms                       | unresolved        | unverified                                                        | a3ed60a48ff907c20518a2aaf1e5c0ed910949941652f6e98d9d8b49687b25b4 | No trustworthy origin established. Existing payload retained unchanged.                                                                                                                                                                |
| better-interface                   | updated           | jakubkrehel/skills                                                | 4c66b1fa86e9ab70187b43d7da9b6fdb29f2ef63                         | Existing discovery metadata and explicit-only flags preserved; Existing marked Core overlays and compatibility corrections retained; Refresh does not execute imported scripts/assets; explicit synthetic tests validate reviewed h... |
| better-layout                      | updated           | jakubkrehel/skills                                                | 4c66b1fa86e9ab70187b43d7da9b6fdb29f2ef63                         | Existing discovery metadata and explicit-only flags preserved; Existing marked Core overlays and compatibility corrections retained; Refresh does not execute imported scripts/assets; explicit synthetic tests validate reviewed h... |
| better-typography                  | updated           | jakubkrehel/skills                                                | 4c66b1fa86e9ab70187b43d7da9b6fdb29f2ef63                         | Existing discovery metadata and explicit-only flags preserved; Existing marked Core overlays and compatibility corrections retained; Refresh does not execute imported scripts/assets; explicit synthetic tests validate reviewed h... |
| better-ui                          | updated           | jakubkrehel/skills                                                | 4c66b1fa86e9ab70187b43d7da9b6fdb29f2ef63                         | Existing discovery metadata and explicit-only flags preserved; Existing marked Core overlays and compatibility corrections retained; Refresh does not execute imported scripts/assets; explicit synthetic tests validate reviewed h... |
| better-writing                     | updated           | jakubkrehel/skills                                                | 4c66b1fa86e9ab70187b43d7da9b6fdb29f2ef63                         | Existing discovery metadata and explicit-only flags preserved; Existing marked Core overlays and compatibility corrections retained; Refresh does not execute imported scripts/assets; explicit synthetic tests validate reviewed h... |
| cache-components                   | current           | Asymmetric-al/core                                                | 8ebb9692f2f37b403576c12da21e6d0be9abb0e91a380f0701ef6ffbee7498b0 | Retain repository-owned installed-contract guidance; upstream inspiration is lineage and does not imply imported or latest upstream content.                                                                                           |
| check-compiler-errors              | current           | cursor/plugins                                                    | 1ad76beccd581fc285199334709e0a37cdc2f76e5d0d33c90e1dc21905518004 | Complete installed payload matches reviewed source after repository formatting; local provenance or Core sync notes are retained.                                                                                                      |
| claude-handoff                     | updated           | mattpocock/skills                                                 | 5beb35b040e3de97e54fa9e386d7e42d15c295c2                         | Existing discovery metadata and explicit-only flags preserved; Existing marked Core overlays and compatibility corrections retained; Refresh does not execute imported scripts/assets; explicit synthetic tests validate reviewed h... |
| clean-code                         | unresolved        | jackjin1997/ClawForge                                             | bf0620e4cf7bf40abc25141122e910aebb23c3257a00d50e205bfbcdd2dec406 | Known lineage; applicable original license unresolved. Existing payload retained unchanged.                                                                                                                                            |
| cms-migration                      | current           | payloadcms/skills                                                 | f1799f2471e4d1a35189a6af406677ffb1bc1f83f0681ce0f6a6c7d0fc75c594 | Core-authored public-v4 content-migration adapter; generic upstream workflow is contextual lineage.                                                                                                                                    |
| code-review                        | updated           | mattpocock/skills                                                 | 5beb35b040e3de97e54fa9e386d7e42d15c295c2                         | Existing discovery metadata and explicit-only flags preserved; Existing marked Core overlays and compatibility corrections retained; Refresh does not execute imported scripts/assets; explicit synthetic tests validate reviewed h... |
| code-review-excellence             | updated           | wshobson/agents                                                   | 0874a27b17a22e2b7c2e2bcd725768e0803cad06                         | Added marked Core applicability, ecosystem ownership, and non-executing maintenance overlay.; Normalized Markdown trailing whitespace and final newlines; retained hard breaks without trailing spaces.; Registered the reviewed co... |
| codebase-design                    | updated           | mattpocock/skills                                                 | 5beb35b040e3de97e54fa9e386d7e42d15c295c2                         | Existing discovery metadata and explicit-only flags preserved; Existing marked Core overlays and compatibility corrections retained; Refresh does not execute imported scripts/assets; explicit synthetic tests validate reviewed h... |
| commit                             | current           | Asymmetric-al/core                                                | d90bd243f520d9c7574970d627a15759ea66f2f691c1cb071966bc022a48679c | Retain repository-owned installed-contract guidance; upstream inspiration is lineage and does not imply imported or latest upstream content.                                                                                           |
| components-build                   | unresolved        | nolly-studio/components-build-skill                               | 55c76ed69a72f69b9e0a19ac08422f64bf88624f4f5f4069903f418883efba97 | Retain Core Base UI/base-maia workflow inserted above unchanged upstream specification.                                                                                                                                                |
| control-cli                        | current           | cursor/plugins                                                    | 13ac93e595bbda2000849bdb815d5f2ca03f7c2ca63788c8335f9212b9b422a2 | Complete installed payload matches reviewed source after repository formatting; local provenance or Core sync notes are retained.                                                                                                      |
| control-ui                         | current           | cursor/plugins                                                    | 410cae25bdb1e5d2323b126abc5047b0213be7fdb0195710213fa8de8a751871 | Complete installed payload matches reviewed source after repository formatting; local provenance or Core sync notes are retained.                                                                                                      |
| create-agent                       | retained-snapshot | ikindacodes/ship-eve                                              | b3a68e436125f404296976c6978248be1e86aafbe259675ef4cdd6f987a6db5a | Installed source no longer published; retain existing snapshot.; Installed source path is absent from current upstream tree; retain existing snapshot without a freshness claim.                                                       |
| deploy-to-vercel                   | current           | vercel-labs/agent-skills                                          | cfcc3dd479ab2e0ae721ddf39b8af84d977321487672f1487c8d6855f576927b | Entrypoint matches after formatting and both installed resources/*.sh files match upstream bytes exactly. Archive.zip is an unreferenced macOS distribution archive containing duplicates/older packaged source and __MACOSX resour... |
| deployment-pipeline-design         | updated           | wshobson/agents                                                   | 0874a27b17a22e2b7c2e2bcd725768e0803cad06                         | Added marked Core applicability, ecosystem ownership, and non-executing maintenance overlay.; Corrected the upstream advanced-strategies link relative to its moved details reference.; Normalized Markdown trailing whitespace and... |
| design-an-interface                | retained-snapshot | mattpocock/skills                                                 | a2596e9fa2d50e23ba014f64a5b8f9df4eb56b846a52cad152899ef5eb97b085 | Removed upstream; retain compatibility snapshot.; Installed source path is absent from current upstream tree; retain existing snapshot without a freshness claim.                                                                      |
| design-system-patterns             | updated           | wshobson/agents                                                   | 0874a27b17a22e2b7c2e2bcd725768e0803cad06                         | Added marked Core applicability, ecosystem ownership, and non-executing maintenance overlay.; Normalized Markdown trailing whitespace and final newlines; retained hard breaks without trailing spaces.; Registered the reviewed co... |
| design-taste-frontend              | updated           | leonxlnx/taste-skill                                              | 6010f91a9935f1c167dfc500fb1a475681892e6b                         | Existing discovery metadata and explicit-only flags preserved; Existing marked Core overlays and compatibility corrections retained; Refresh does not execute imported scripts/assets; explicit synthetic tests validate reviewed h... |
| deslop                             | current           | cursor/plugins                                                    | 2f7b7def74af7ed11f5b44b4d32f0f91fca8c5d1f92bf2171e8d12fd33a0f810 | Complete installed payload matches reviewed source after repository formatting; local provenance or Core sync notes are retained.                                                                                                      |
| diagnosing-bugs                    | updated           | mattpocock/skills                                                 | 5beb35b040e3de97e54fa9e386d7e42d15c295c2                         | Existing discovery metadata and explicit-only flags preserved; Existing marked Core overlays and compatibility corrections retained; Refresh does not execute imported scripts/assets; explicit synthetic tests validate reviewed h... |
| domain-model                       | current           | Asymmetric-al/core                                                | 709f15eefe569e817eada2354acfd8b30f4251461e0e64e7f446ff798c5c03e3 | Retain repository-owned installed-contract guidance; upstream inspiration is lineage and does not imply imported or latest upstream content.                                                                                           |
| domain-modeling                    | updated           | mattpocock/skills                                                 | 5beb35b040e3de97e54fa9e386d7e42d15c295c2                         | Existing discovery metadata and explicit-only flags preserved; Existing marked Core overlays and compatibility corrections retained; Refresh does not execute imported scripts/assets; explicit synthetic tests validate reviewed h... |
| edit-article                       | retained-snapshot | mattpocock/skills                                                 | e10fba546f45357fe0aaa7494b9e186910d4525818d19f9b2ad6f28cc506aa5e | Removed upstream; retain compatibility snapshot.; Installed source path is absent from current upstream tree; retain existing snapshot without a freshness claim.                                                                      |
| email-best-practices               | updated           | resend/resend-skills                                              | b2ae7b1798b70134faf679f35fc05b4331462988                         | Correct invalid new AbortSignal.timeout constructor to static AbortSignal.timeout factory                                                                                                                                              |
| emil-design-eng                    | updated           | emilkowalski/skills                                               | 2d228630ba1446365f614a108cb8252f1feda202                         | Existing discovery metadata and explicit-only flags preserved; Existing marked Core overlays and compatibility corrections retained; Refresh does not execute imported scripts/assets; explicit synthetic tests validate reviewed h... |
| emil-design-engineering            | retained-snapshot | https://animations.dev                                            | 9241a90b597d37939829efe745b9bbea2cde6e4b42c21bc71aeb48241f37d675 | Licensed installed animations.dev snapshot; no activation installer run.; Retain licensed installed animations.dev snapshot; activation installer was not executed.                                                                    |
| emil-prototype                     | updated           | emilkowalski/skills                                               | 2d228630ba1446365f614a108cb8252f1feda202                         | Existing discovery metadata and explicit-only flags preserved; Existing marked Core overlays and compatibility corrections retained; Refresh does not execute imported scripts/assets; explicit synthetic tests validate reviewed h... |
| eve                                | current           | vercel/eve                                                        | 35a7c82f96e20871ff91e9a3a0054ac110f341d35050ed72cd79f441fb9be8a6 | Existing source matches reviewed upstream after repository formatting; retain Core overlays.                                                                                                                                           |
| find-animation-opportunities       | current           | Asymmetric-al/core                                                | 087c81608fc0a233366d191b630cefa9a8c450efff951b56ea0b553fadb4d9d9 | Retain repository-owned installed-contract guidance; upstream inspiration is lineage and does not imply imported or latest upstream content.                                                                                           |
| find-skills                        | current           | Asymmetric-al/core                                                | 455e34bad360725053c121d7d7c4ae8f16222ddb3f8cfbbbd357df65f1c1246e | Retain repository-owned installed-contract guidance; upstream inspiration is lineage and does not imply imported or latest upstream content.                                                                                           |
| fix-ci                             | current           | cursor/plugins                                                    | 925f8c3e11de8bcc0cd015ec907f4d00b12cde6714246554ed3a52e096536522 | Complete installed payload matches reviewed source after repository formatting; local provenance or Core sync notes are retained.                                                                                                      |
| fix-merge-conflicts                | current           | cursor/plugins                                                    | 738b251281b30fd33e3892d0679cf94249e9c9e29e1bed40bcdde4a6aca98a76 | Complete installed payload matches reviewed source after repository formatting; local provenance or Core sync notes are retained.                                                                                                      |
| frontend-design                    | current           | anthropics/skills                                                 | 34040c9c568585f6929bedeaad110ad08f079624                         | Retain explicit-only discovery metadata and marked Core design authority overlay.                                                                                                                                                      |
| get-pr-comments                    | current           | cursor/plugins                                                    | 8bf292736cab922276feb4d8377edc2fc4102a7beb62bcd1f3f5cf72a79b16cc | Complete installed payload matches reviewed source after repository formatting; local provenance or Core sync notes are retained.                                                                                                      |
| git-guardrails-claude-code         | current           | mattpocock/skills                                                 | 69b291d655626a01602b998a1836fcb93c058ede68dfafddfd71e87f17074764 | Existing source matches reviewed upstream after repository formatting; retain Core overlays.                                                                                                                                           |
| github-actions-templates           | updated           | wshobson/agents                                                   | 0874a27b17a22e2b7c2e2bcd725768e0803cad06                         | Added marked Core applicability, ecosystem ownership, and non-executing maintenance overlay.; Normalized Markdown trailing whitespace and final newlines; retained hard breaks without trailing spaces.; Registered the reviewed co... |
| grill-for-unknowns                 | current           | nicobailon/grill-for-unknowns                                     | 10b81abff023288216db9dd368efd79824e14b386ad1a2b764831312fb220533 | Retain explicit-only description/frontmatter and marked Core workflow context.                                                                                                                                                         |
| grill-me                           | current           | mattpocock/skills                                                 | caaf8b8de1684f96e26b28f3c29189db5c89cce4b73e1c93d86164f66ef88637 | Existing source matches reviewed upstream after repository formatting; retain Core overlays.                                                                                                                                           |
| grill-with-docs                    | current           | mattpocock/skills                                                 | 7de372c13488f1ee96cc11cd8907b56b6809cc93eef776eeddd37de6b6cbe3fe | Existing source matches reviewed upstream after repository formatting; retain Core overlays.                                                                                                                                           |
| grilling                           | updated           | mattpocock/skills                                                 | 5beb35b040e3de97e54fa9e386d7e42d15c295c2                         | Existing discovery metadata and explicit-only flags preserved; Existing marked Core overlays and compatibility corrections retained; Refresh does not execute imported scripts/assets; explicit synthetic tests validate reviewed h... |
| handoff                            | updated           | mattpocock/skills                                                 | 5beb35b040e3de97e54fa9e386d7e42d15c295c2                         | Existing discovery metadata and explicit-only flags preserved; Existing marked Core overlays and compatibility corrections retained; Refresh does not execute imported scripts/assets; explicit synthetic tests validate reviewed h... |
| idempotency-handling               | current           | aj-geddes/useful-ai-prompts                                       | 5ed3ee0194ee5236582ac95c5686f59d5cee07428663adf3066e4f7164b11c54 | Retain Core backend/data-access authority and repository idempotency paths.                                                                                                                                                            |
| impeccable                         | updated           | pbakaus/impeccable                                                | 8644175285360c166e57b1e35ecadfbc85ff5209                         | Mark Core design-system, ownership, and explicit launcher/hook boundaries                                                                                                                                                              |
| implement                          | updated           | mattpocock/skills                                                 | 5beb35b040e3de97e54fa9e386d7e42d15c295c2                         | Existing discovery metadata and explicit-only flags preserved; Existing marked Core overlays and compatibility corrections retained; Refresh does not execute imported scripts/assets; explicit synthetic tests validate reviewed h... |
| improve                            | current           | shadcn/improve                                                    | 1599aa29e9b16424cb767779efac53fa56e3f38be92dff4ac587393a1ad5070a | Existing source matches reviewed upstream after repository formatting; retain Core overlays.                                                                                                                                           |
| improve-animations                 | updated           | emilkowalski/skills                                               | 2d228630ba1446365f614a108cb8252f1feda202                         | Existing discovery metadata and explicit-only flags preserved; Existing marked Core overlays and compatibility corrections retained; Refresh does not execute imported scripts/assets; explicit synthetic tests validate reviewed h... |
| improve-codebase-architecture      | updated           | mattpocock/skills                                                 | 5beb35b040e3de97e54fa9e386d7e42d15c295c2                         | Existing discovery metadata and explicit-only flags preserved; Existing marked Core overlays and compatibility corrections retained; Refresh does not execute imported scripts/assets; explicit synthetic tests validate reviewed h... |
| inngest                            | current           | Asymmetric-al/core                                                | 26d242b77ff34e04e10526c64d91431f3273df47cb980442babeccb6b9c4a363 | Retain repository-owned installed-contract guidance; upstream inspiration is lineage and does not imply imported or latest upstream content.                                                                                           |
| inngest-agents                     | current           | inngest/inngest-codex-plugin                                      | 351e14c55a01f3924ab47f9feb69bae615b8bb52                         | Preserve Core official-source/MCP precedence, installed-version scope and reference-path adaptations from targeted Inngest refresh.                                                                                                    |
| inngest-api                        | current           | inngest/inngest-codex-plugin                                      | 351e14c55a01f3924ab47f9feb69bae615b8bb52                         | Preserve product/runtime ownership overlay and remap unavailable inngest-cloud skill to available connected Cloud tools; local MCP checklist distinguished from Cloud OAuth; Restore and persist Insights cross-link to sibling ins... |
| inngest-api-cli                    | current           | inngest/inngest-codex-plugin                                      | 351e14c55a01f3924ab47f9feb69bae615b8bb52                         | Preserve product/runtime ownership overlay and remap unavailable inngest-cloud skill to available connected Cloud tools; local MCP checklist distinguished from Cloud OAuth                                                            |
| inngest-brownfield-audit           | current           | inngest/inngest-codex-plugin                                      | 351e14c55a01f3924ab47f9feb69bae615b8bb52                         | Preserve Core official-source/MCP precedence, installed-version scope and reference-path adaptations from targeted Inngest refresh.                                                                                                    |
| inngest-durable-functions          | current           | inngest/inngest-skills                                            | 082798a627bbe9c3ed3a6638a9f56116a035f122                         | Preserve Core official-source/MCP precedence, installed-version scope and reference-path adaptations from targeted Inngest refresh.                                                                                                    |
| inngest-events                     | current           | inngest/inngest-skills                                            | 082798a627bbe9c3ed3a6638a9f56116a035f122                         | Preserve Core official-source/MCP precedence, installed-version scope and reference-path adaptations from targeted Inngest refresh.                                                                                                    |
| inngest-flow-control               | current           | inngest/inngest-skills                                            | 082798a627bbe9c3ed3a6638a9f56116a035f122                         | Preserve Core official-source/MCP precedence, installed-version scope and reference-path adaptations from targeted Inngest refresh.                                                                                                    |
| inngest-middleware                 | current           | inngest/inngest-skills                                            | 082798a627bbe9c3ed3a6638a9f56116a035f122                         | Preserve Core official-source/MCP precedence, installed-version scope and reference-path adaptations from targeted Inngest refresh.                                                                                                    |
| inngest-realtime                   | current           | inngest/inngest-skills                                            | 082798a627bbe9c3ed3a6638a9f56116a035f122                         | Preserve Core official-source/MCP precedence, installed-version scope and reference-path adaptations from targeted Inngest refresh.                                                                                                    |
| inngest-setup                      | current           | inngest/inngest-skills                                            | 082798a627bbe9c3ed3a6638a9f56116a035f122                         | Preserve Core official-source/MCP precedence, installed-version scope and reference-path adaptations from targeted Inngest refresh.                                                                                                    |
| inngest-steps                      | current           | inngest/inngest-skills                                            | 082798a627bbe9c3ed3a6638a9f56116a035f122                         | Preserve Core official-source/MCP precedence, installed-version scope and reference-path adaptations from targeted Inngest refresh.                                                                                                    |
| inngest-v3-v4-migration            | current           | inngest/inngest-codex-plugin                                      | 351e14c55a01f3924ab47f9feb69bae615b8bb52                         | Preserve Core official-source/MCP precedence, installed-version scope and reference-path adaptations from targeted Inngest refresh.                                                                                                    |
| interface-design                   | updated           | Dammyjay93/interface-design                                       | 2f9be3206855bcb2d1d0af262c8bae25cba6658d                         | Preserved explicit-only invocation in discovery and UI policy; removed four superseded upstream references after complete inventory review.; Added marked Core applicability, ecosystem ownership, and non-executing maintenance ov... |
| interface-review                   | updated           | jakubkrehel/skills                                                | 4c66b1fa86e9ab70187b43d7da9b6fdb29f2ef63                         | Existing discovery metadata and explicit-only flags preserved; Existing marked Core overlays and compatibility corrections retained; Refresh does not execute imported scripts/assets; explicit synthetic tests validate reviewed h... |
| lint-and-validate                  | current           | davila7/claude-code-templates                                     | 5bbe5a76f1feb48cdadee248fd169cf53e053783                         | Removed unconditional audit/fix defaults and generic npm/npx commands from the primary workflow; generic helper scripts remain reference-only in Core.; Added marked Core applicability, ecosystem ownership, and non-executing mai... |
| loop-me                            | current           | mattpocock/skills                                                 | e44d1cc3e760fb86ac42964c2a5f1fcac511715db50fb375f3f7be814de1eaa7 | Existing source matches reviewed upstream after repository formatting; retain Core overlays.                                                                                                                                           |
| loop-on-ci                         | current           | cursor/plugins                                                    | 66b85dbd2bc3700386283539292a55438652bbe227271fd90b73b74525b9b9de | Complete installed payload matches reviewed source after repository formatting; local provenance or Core sync notes are retained.                                                                                                      |
| make-pr-easy-to-review             | current           | cursor/plugins                                                    | e8da0d4a85b7c04823698f539251617389f827fd9137100ef7eaea5dcc992fe7 | Complete installed payload matches reviewed source after repository formatting; local provenance or Core sync notes are retained.                                                                                                      |
| migrate-to-shoehorn                | current           | mattpocock/skills                                                 | de4da4c11d924fac79c924b2ee3d2db4a5cb98386eb490a599119463d036ae72 | Existing source matches reviewed upstream after repository formatting; retain Core overlays.                                                                                                                                           |
| moai-library-shadcn                | current           | Asymmetric-al/core                                                | 7188477b97ecf9685c96f66170c50bf7e5f531e0a4c06e3bdd4a5bbc5b1fc219 | Retain repository-owned installed-contract guidance; upstream inspiration is lineage and does not imply imported or latest upstream content.; Align the local class-helper guidance with installed cn@0.4.0 and shared @asym/ui own... |
| mobile-native                      | updated           | emilkowalski/skills                                               | 2d228630ba1446365f614a108cb8252f1feda202                         | Existing discovery metadata and explicit-only flags preserved; Existing marked Core overlays and compatibility corrections retained; Refresh does not execute imported scripts/assets; explicit synthetic tests validate reviewed h... |
| motion                             | current           | Asymmetric-al/core                                                | 45107d30f5418bcbad5d0de80c4f4bbf8d8afb7ae295c5291b1f980e024d7292 | Retain repository-owned installed-contract guidance; upstream inspiration is lineage and does not imply imported or latest upstream content.                                                                                           |
| nestjs-best-practices              | unresolved        | Kadajett/agent-nestjs-skills                                      | 9af2b33ca5b428637fe98e9b91e9f3ae064ddd359e96cdda7dc199d490b0a102 | Existing source matches reviewed upstream after repository formatting; retain Core overlays.                                                                                                                                           |
| new-branch-and-pr                  | current           | cursor/plugins                                                    | 4e8f502fcf48553949387a9a7f58b21349e0ff87c24bf8ff5c0013e9da6819fd | Complete installed payload matches reviewed source after repository formatting; local provenance or Core sync notes are retained.                                                                                                      |
| next-cache-components-adoption     | updated           | vercel/next.js                                                    | 684cf7ea8915613a53e1ed34d88d2cfb093ed57d                         | Reviewed immutable source with existing Core compatibility preserved.                                                                                                                                                                  |
| next-cache-components-optimizer    | updated           | vercel/next.js                                                    | 684cf7ea8915613a53e1ed34d88d2cfb093ed57d                         | Reviewed immutable source with existing Core compatibility preserved.                                                                                                                                                                  |
| next-dev-loop                      | updated           | vercel/next.js                                                    | 684cf7ea8915613a53e1ed34d88d2cfb093ed57d                         | Reviewed immutable source with existing Core compatibility preserved.                                                                                                                                                                  |
| nextjs-app-architecture            | updated           | aurorascharff/nextjs-app-architecture-skill                       | 84842f3c66da70462f36753603db86a347dfb83c                         | Three-way merge preserves all Core ownership and installed-version corrections; new references carry marked Core compatibility overlay                                                                                                 |
| nextjs-app-router                  | current           | Asymmetric-al/core                                                | f784cb01f5a4c0b8ed88de0990bfe4ce7520266834084ef2e2f7804d9fd4a128 | Retain repository-owned installed-contract guidance; upstream inspiration is lineage and does not imply imported or latest upstream content.                                                                                           |
| nextjs-supabase-auth               | current           | Asymmetric-al/core                                                | c9e88988741f518433ea23520b711f8fd1ffc293e10e05c519f297b0558df78d | Retain repository-owned installed-contract guidance; upstream inspiration is lineage and does not imply imported or latest upstream content.                                                                                           |
| nodejs-backend-patterns            | updated           | wshobson/agents                                                   | 0874a27b17a22e2b7c2e2bcd725768e0803cad06                         | Added marked Core applicability, ecosystem ownership, and non-executing maintenance overlay.; Normalized Markdown trailing whitespace and final newlines; retained hard breaks without trailing spaces.; Registered the reviewed co... |
| npm-deps-cleanup                   | unresolved        | anthonyshew/dotfiles                                              | ec6439b43e58b9cd672fbb6e6644e0d809d875b009f457a3f2b213f5e8ab3069 | Existing source matches reviewed upstream after repository formatting; retain Core overlays.                                                                                                                                           |
| obsidian-vault                     | retained-snapshot | mattpocock/skills                                                 | 7bed1d552aa5e9345e493cd62cb13e65c5d829d153c349afdb2cb91c809fa6c4 | Removed upstream; retain compatibility snapshot.; Installed source path is absent from current upstream tree; retain existing snapshot without a freshness claim.                                                                      |
| openspec-apply-change              | current           | Fission-AI/OpenSpec                                               | 40fc0655ae650213a130f376eed1475527d6c65cdc32973754449776a3227152 | Reviewed against installed OpenSpec v1.14.3 source, preserving committed Core overlay and CLI adapters; this is not a latest-HEAD claim.                                                                                               |
| openspec-archive-change            | current           | Fission-AI/OpenSpec                                               | b080e65449e9895fb63964c811168943bf99cb131a378b6a9937ed519ae4d37f | Reviewed against installed OpenSpec v1.14.3 source, preserving committed Core overlay and CLI adapters; this is not a latest-HEAD claim.                                                                                               |
| openspec-explore                   | current           | Fission-AI/OpenSpec                                               | e9fe2acf923d5f9376c5e198df235d7cc531913ba3d760faff867f9c60dbfebb | Reviewed against installed OpenSpec v1.14.3 source, preserving committed Core overlay and CLI adapters; this is not a latest-HEAD claim.                                                                                               |
| openspec-propose                   | current           | Fission-AI/OpenSpec                                               | e9f4baa05e9fdbc969fcbdb8b13b4795c19640cc920999cf06c30a1a1934bb5c | Reviewed against installed OpenSpec v1.14.3 source, preserving committed Core overlay and CLI adapters; this is not a latest-HEAD claim.                                                                                               |
| openspec-sync-specs                | current           | Fission-AI/OpenSpec                                               | 474952afb40497c5cb756e5654ddc901619de6b3bd57aaa03fb11d2611a99da3 | Reviewed against installed OpenSpec v1.14.3 source, preserving committed Core overlay and CLI adapters; this is not a latest-HEAD claim.                                                                                               |
| openspec-update-change             | current           | Fission-AI/OpenSpec                                               | 9ca71b1ec6252e743028e561d73df32678e4486f80d2cb63887aa8648dc3a5cb | Reviewed against installed OpenSpec v1.14.3 source, preserving committed Core overlay and CLI adapters; this is not a latest-HEAD claim.                                                                                               |
| openspec-verify-change             | current           | Fission-AI/OpenSpec                                               | 29164b5053d78cbdb1440beda4193fba293f5c65699a40d689de11ced7a61124 | Reviewed against installed OpenSpec v1.14.3 source, preserving committed Core overlay and CLI adapters; this is not a latest-HEAD claim.                                                                                               |
| payload                            | current           | payloadcms/skills                                                 | 050fc66234ef54906e34a1c0f5209ad7558f9adc59a7a0efd4db342f81427e20 | Core-authored public-v4 adapter; upstream reference content is not vendored into this canonical package.                                                                                                                               |
| pdf                                | excluded          | anthropics/skills                                                 | c6ec597784914c8cdce5f2235164f48fbb847a4441a1bf3f74ba69d9bec6662b | Owner excluded PDF pending license review; all three runtime payloads remain byte-identical to baseline.                                                                                                                               |
| pick-ui-library                    | updated           | emilkowalski/skills                                               | 2d228630ba1446365f614a108cb8252f1feda202                         | Existing discovery metadata and explicit-only flags preserved; Existing marked Core overlays and compatibility corrections retained; Refresh does not execute imported scripts/assets; explicit synthetic tests validate reviewed h... |
| playwright-best-practices          | current           | currents-dev/playwright-best-practices-skill                      | 42684b93abd595551d6f4b6949b951645503baa445aefa76aa2f0d52ddda2bf7 | Existing source matches reviewed upstream after repository formatting; retain Core overlays.                                                                                                                                           |
| playwright-cli                     | updated           | microsoft/playwright-cli                                          | b1a5903c5b633b8c9f843ad7b629c2a78437040c                         | Retain compact Core adapter and add regex lookup; source-check commands without invoking browser                                                                                                                                       |
| playwright-skill                   | updated           | testdino-hq/playwright-skill                                      | 178d1cb537604279d7b54500c4823a6db42b9de6                         | Reviewed immutable source with existing Core compatibility preserved.                                                                                                                                                                  |
| pr-review-canvas                   | current           | cursor/plugins                                                    | 88a07a2459197acba3c5e06b7d695e35ad618a998442b72d05cdba4efc117ac6 | Three renderer/template/style companions are identical after trusted repository formatting. Entrypoint differs only by existing exact-filename keys, matching data-diff attributes, and formatting-tolerant JSON-sentinel replaceme... |
| prd-to-plan                        | current           | Asymmetric-al/core                                                | 93d6e072d2a768f712dfba246b6b4053867bbf6134495260bbca7c8e58296ae8 | Retain repository-owned installed-contract guidance; upstream inspiration is lineage and does not imply imported or latest upstream content.                                                                                           |
| prompt-engineering-patterns        | updated           | wshobson/agents                                                   | 0874a27b17a22e2b7c2e2bcd725768e0803cad06                         | Added marked Core applicability, ecosystem ownership, and non-executing maintenance overlay.; Normalized Markdown trailing whitespace and final newlines; retained hard breaks without trailing spaces.; Registered the reviewed co... |
| prototype                          | updated           | mattpocock/skills                                                 | 5beb35b040e3de97e54fa9e386d7e42d15c295c2                         | Complete current prototype tree, logic shareable HTML and primary-source capture imported; Stable name retained; explicit-only frontmatter and native policy enforced; Marked Core ownership, isolated-route and user-authorized br... |
| qa                                 | retained-snapshot | mattpocock/skills                                                 | d9727aac6503981bf69bdd8b37e0d85b32b8fbd353a57528c252dac1337ab761 | Removed upstream; retain compatibility snapshot.; Installed source path is absent from current upstream tree; retain existing snapshot without a freshness claim.                                                                      |
| react-component-dev                | current           | Asymmetric-al/core                                                | 8c4d521e62754039620f0848bdcc05ce50213005f29d805a11ffbe40286d7e34 | Retain repository-owned installed-contract guidance; upstream inspiration is lineage and does not imply imported or latest upstream content.                                                                                           |
| react-doctor                       | current           | Asymmetric-al/core                                                | 57b9cf4477899bc37754c14207ca5ea9ffe2eed1753056d7a2c06cdfcafdc0e0 | Retain repository-owned installed-contract guidance; upstream inspiration is lineage and does not imply imported or latest upstream content.                                                                                           |
| react-email                        | current           | resend/react-email                                                | 6316bdbe822e49f93a709e81bc011569d1a1ea20f7de78cd33ea8a0501ad79b7 | Retain scanner allowlist comments; no upstream instruction delta.                                                                                                                                                                      |
| react-state-management             | updated           | wshobson/agents                                                   | 0874a27b17a22e2b7c2e2bcd725768e0803cad06                         | Added marked Core applicability, ecosystem ownership, and non-executing maintenance overlay.; Normalized Markdown trailing whitespace and final newlines; retained hard breaks without trailing spaces.; Registered the reviewed co... |
| rechart                            | current           | Asymmetric-al/core                                                | 1cf9d6b216df970b7655822e6b2318e713178bd434e3c96aeaf95223315f37bd | Retain repository-owned installed-contract guidance; upstream inspiration is lineage and does not imply imported or latest upstream content.                                                                                           |
| redesign-existing-projects         | retained-snapshot | leonxlnx/taste-skill                                              | ccbc15639c97057cbfcf32ecebc38ef716e4bb37                         | Removed upstream; retain explicit-only snapshot.; Current upstream absence was checked; preserve historical payload and lock identity without claiming a new import.                                                                   |
| remotion-best-practices            | unresolved        | remotion-dev/skills                                               | af627225edda7420907d4f66bc07d9a111ee5e276bd3e45705bf118fb8e7cdbb | Known source; applicable license unresolved. Existing payload retained unchanged.                                                                                                                                                      |
| repo-entry                         | current           | Asymmetric-al/core                                                | a39c8b6747929f0c4cde395a239bd729f5c41c086d01cb0413a6e81b40d4b2d9 | Retain repository-owned installed-contract guidance; upstream inspiration is lineage and does not imply imported or latest upstream content.                                                                                           |
| request-refactor-plan              | retained-snapshot | mattpocock/skills                                                 | d59de4ba6cc1fe2dd267e8b9b5a1fd88e3e739e2130bc9dd78061d2a072830b8 | Removed upstream; retain compatibility snapshot.; Installed source path is absent from current upstream tree; retain existing snapshot without a freshness claim.                                                                      |
| research                           | current           | mattpocock/skills                                                 | 985569f15739c713d6784887c3d186d4ef9ac85bec5ad9c068d25bf0739928e4 | Existing source matches reviewed upstream after repository formatting; retain Core overlays.                                                                                                                                           |
| resend                             | updated           | resend/resend-skills                                              | b2ae7b1798b70134faf679f35fc05b4331462988                         | Reviewed immutable source with existing Core compatibility preserved.                                                                                                                                                                  |
| resend-cli                         | updated           | resend/resend-cli                                                 | d4367e18c194f2bb555aad99bf8851f21e81606a                         | Preserve CLI/product ownership and secret-safe noninteractive workflow                                                                                                                                                                 |
| resolving-merge-conflicts          | retained-snapshot | mattpocock/skills                                                 | 9d8114f8ef0b31f535a265fc05c364bd8cf2e2895a830040e06c22acb11f54b0 | Removed upstream; retain standalone workflow.; Current upstream absence was checked; preserve historical payload and lock identity without claiming a new import.                                                                      |
| reui                               | updated           | https://mcp.reui.io/api/skills/download                           | baa3be2c5e407e71afdd8d53f4c26a2bbeb3e091e4a468d2acddbe2d104333d5 | Retain all Core overlays, migrate removed craft/styling overlays to replacement files, preserve Filters/NumberField fixes, staged refresh and shared table ownership; Reject unsafe decoded Unicode metadata while preserving valid... |
| review-and-ship                    | current           | cursor/plugins                                                    | 5c8e88c91e726e024c824d2b02be6bfc7ad81ac5e67c104ef2b66840715373c1 | Complete installed payload matches reviewed source after repository formatting; local provenance or Core sync notes are retained.                                                                                                      |
| review-animations                  | updated           | emilkowalski/skills                                               | 2d228630ba1446365f614a108cb8252f1feda202                         | Existing discovery metadata and explicit-only flags preserved; Existing marked Core overlays and compatibility corrections retained; Refresh does not execute imported scripts/assets; explicit synthetic tests validate reviewed h... |
| run-smoke-tests                    | current           | cursor/plugins                                                    | 848c9f34af50f8a0edecbdc239707b694f5f9ac497c61b5907f2bf0caa1372fb | Complete installed payload matches reviewed source after repository formatting; local provenance or Core sync notes are retained.                                                                                                      |
| samson-factory                     | current           | Asymmetric-al/core                                                | 1586b4669639d928227e17a8720f0f45502dcee1cd4bafc75ac78eca33eaef64 | Retain repository-owned installed-contract guidance; upstream inspiration is lineage and does not imply imported or latest upstream content.                                                                                           |
| scaffold-exercises                 | current           | mattpocock/skills                                                 | 75f5c9d771606fb9762f16522efc954df11c324f87148d8ff069bce166257de9 | Existing source matches reviewed upstream after repository formatting; retain Core overlays.                                                                                                                                           |
| security-audit                     | updated           | cloudflare/security-audit-skill                                   | c1c8a8c1471069fb0e188eeaff69b8e8db6564a8                         | Marked Core context overlay; preserve upstream operating, sandbox, artifacts and independent-verification contracts. Validator/schema semantics unchanged.                                                                             |
| setup-matt-pocock-skills           | updated           | mattpocock/skills                                                 | 5beb35b040e3de97e54fa9e386d7e42d15c295c2                         | Existing discovery metadata and explicit-only flags preserved; Existing marked Core overlays and compatibility corrections retained; Refresh does not execute imported scripts/assets; explicit synthetic tests validate reviewed h... |
| setup-pre-commit                   | current           | mattpocock/skills                                                 | c9819d7f1e3b198064edc1faa3154224ed67395e9f07f5d3cea4b67cf0a11a98 | Existing source matches reviewed upstream after repository formatting; retain Core overlays.                                                                                                                                           |
| shadcn                             | updated           | shadcn-ui/ui                                                      | 25af02b1b467fcd53b63e0c6d6d324c57c16ef18                         | Preserve existing shared Sonner host and Base UI/base-maia boundaries                                                                                                                                                                  |
| shadcn-ui                          | updated           | google-labs-code/stitch-skills                                    | 0337446dadde6f8c94210444e2aa9d546126480f                         | Preserved reviewed data-table Base UI render/group/type-only/gap fixes via existing sync adapter.; Preserved cn helper/docs/setup detection, while taking upstream node_modules exclusion in find commands.; Added marked Core appl... |
| skill-creator                      | current           | anthropics/skills                                                 | dbd4588f9e1033efb41dad4bef2f7947c8993d44                         | Preserved Core JSON script-tag escaping; no helper or evaluation was executed.; Added marked Core applicability, ecosystem ownership, and non-executing maintenance overlay.; Registered the reviewed compatibility adapter in sync... |
| stripe-best-practices              | updated           | https://docs.stripe.com/.well-known/skills/stripe-best-practices/ | a240f40c84c43f8c216eb159ba427d2979a40038fc9eeeab15efc02ea7ae3a40 | Core version, payment method, product tax-code, credential and provisioning contracts preserved                                                                                                                                        |
| stripe-integration                 | updated           | wshobson/agents                                                   | 0874a27b17a22e2b7c2e2bcd725768e0803cad06                         | Added marked Core applicability, ecosystem ownership, and non-executing maintenance overlay.; Normalized Markdown trailing whitespace and final newlines; retained hard breaks without trailing spaces.; Registered the reviewed co... |
| stripe-projects                    | updated           | https://docs.stripe.com/.well-known/skills/stripe-projects/       | 3f6f72b6fe29418f2740977f2d4bc5c6e7675562df41b94e4da4ad34fd590bd7 | Core version, payment method, product tax-code, credential and provisioning contracts preserved                                                                                                                                        |
| supabase                           | updated           | supabase/agent-skills                                             | c9be0e931b7930f7d02126d04774d904c381e7d7                         | Preserve backend/auth/migration routing and opaque existing credentials                                                                                                                                                                |
| supabase-postgres-best-practices   | updated           | supabase/agent-skills                                             | c9be0e931b7930f7d02126d04774d904c381e7d7                         | Retain Core database triggers, auth routing, workflow, checklist and migration guidance                                                                                                                                                |
| systematic-debugging               | updated           | obra/superpowers                                                  | 2ce8aa15d05bd57213e6f746f953aafb7ded7a8b                         | Remapped unavailable Superpowers workflow requirements to Core's authoritative TDD and test rulebook.; Added marked Core applicability, ecosystem ownership, and non-executing maintenance overlay.; Registered the reviewed compat... |
| tailwind-design-system             | updated           | wshobson/agents                                                   | 0874a27b17a22e2b7c2e2bcd725768e0803cad06                         | Preserved Core cn helper in the new upstream reference location.; Added marked Core applicability, ecosystem ownership, and non-executing maintenance overlay.; Normalized Markdown trailing whitespace and final newlines; retaine... |
| tailwind-v4-shadcn                 | retained-snapshot | jezweb/claude-skills                                              | 10a1f16679a5aab8e0c2f4d04e8560402f34d04b                         | Verified discontinued snapshot; no fork substituted.; Verified discontinued upstream snapshot retained; no unrelated fork substituted.; Align the local class-helper guidance with installed cn@0.4.0 and shared @asym/ui ownership... |
| tdd                                | updated           | mattpocock/skills                                                 | 5beb35b040e3de97e54fa9e386d7e42d15c295c2                         | Existing discovery metadata and explicit-only flags preserved; Existing marked Core overlays and compatibility corrections retained; Refresh does not execute imported scripts/assets; explicit synthetic tests validate reviewed h... |
| teach                              | updated           | mattpocock/skills                                                 | 5beb35b040e3de97e54fa9e386d7e42d15c295c2                         | Original explicit-only discovery metadata preserved; Teaching workspace glossary templates retain their own GLOSSARY names without changing Core project CONTEXT documents; No imported script executed                                |
| test-driven-development            | updated           | obra/superpowers                                                  | 2ce8aa15d05bd57213e6f746f953aafb7ded7a8b                         | Existing discovery metadata and explicit-only flags preserved; Existing marked Core overlays and compatibility corrections retained; Refresh does not execute imported scripts/assets; explicit synthetic tests validate reviewed h... |
| thermo-nuclear-code-quality-review | current           | cursor/plugins                                                    | 7faca08b51b643b2ddd0836f92af15574444024685dcc1e677dbbb39ae8c9e8f | Complete installed payload matches reviewed source after repository formatting; local provenance or Core sync notes are retained.                                                                                                      |
| tiptap                             | updated           | ueberdosis/tiptap                                                 | 5b6bee8090e857d1a285427b12a8e79eaedd98a5                         | Reviewed immutable source with existing Core compatibility preserved.                                                                                                                                                                  |
| to-spec                            | current           | mattpocock/skills                                                 | 43ad9cf318e5e7d3d1fa360253a37021796dc87a0c2e595ad262661a10f85088 | Existing source matches reviewed upstream after repository formatting; retain Core overlays.                                                                                                                                           |
| to-tickets                         | updated           | mattpocock/skills                                                 | 5beb35b040e3de97e54fa9e386d7e42d15c295c2                         | Existing discovery metadata and explicit-only flags preserved; Existing marked Core overlays and compatibility corrections retained; Refresh does not execute imported scripts/assets; explicit synthetic tests validate reviewed h... |
| triage                             | updated           | mattpocock/skills                                                 | 5beb35b040e3de97e54fa9e386d7e42d15c295c2                         | Existing discovery metadata and explicit-only flags preserved; Existing marked Core overlays and compatibility corrections retained; Refresh does not execute imported scripts/assets; explicit synthetic tests validate reviewed h... |
| turborepo                          | updated           | vercel/turborepo                                                  | b90e6ea31e02ab150b8ab85f5fab18b941b21e75                         | Reviewed immutable source with existing Core compatibility preserved.                                                                                                                                                                  |
| typescript-advanced-types          | updated           | wshobson/agents                                                   | 0874a27b17a22e2b7c2e2bcd725768e0803cad06                         | Added marked Core applicability, ecosystem ownership, and non-executing maintenance overlay.; Normalized Markdown trailing whitespace and final newlines; retained hard breaks without trailing spaces.; Registered the reviewed co... |
| typescript-expert                  | updated           | davila7/claude-code-templates                                     | 5bbe5a76f1feb48cdadee248fd169cf53e053783                         | Removed missing mandatory specialist bundle/stop flow and npm/npx fallback validation; preserve Core compiler and project scripts.; Added marked Core applicability, ecosystem ownership, and non-executing maintenance overlay.; N... |
| ubiquitous-language                | retained-snapshot | mattpocock/skills                                                 | 2449e2345b96b9f1e861c697b5eab50d03ae1254481a4306b6f815684e523b3a | Removed upstream; retain compatibility snapshot.; Installed source path is absent from current upstream tree; retain existing snapshot without a freshness claim.                                                                      |
| upgrade-stripe                     | updated           | https://docs.stripe.com/.well-known/skills/upgrade-stripe/        | 30e6f0dd9bc353768b35d1a768ae58e31219ffa992d39bae347d8950c29b563b | Core version, payment method, product tax-code, credential and provisioning contracts preserved                                                                                                                                        |
| use-dom                            | updated           | expo/skills                                                       | 3d1ca4e2a3c5ffc14817a85dde0bf1b188e9753d                         | Kept installed use-dom slug/name/UI prompt for the verified expo-dom successor and removed automatic external feedback instructions.; Added marked Core applicability, ecosystem ownership, and non-executing maintenance overlay.;... |
| vercel-cli-with-tokens             | current           | vercel-labs/agent-skills                                          | c06bea99e75eab07fde4fae26069baa002f82f39b53f07981704c2901551dd4c | Complete installed payload matches reviewed source after repository formatting; local provenance or Core sync notes are retained.                                                                                                      |
| vercel-composition-patterns        | current           | vercel-labs/agent-skills                                          | e38e0eaa609316b10423a9a138ed95e35099accd3f735585295c8a8f165c28a3 | All installed guidance and support content matches reviewed source after trusted repository formatting. Optional metadata.json is catalog/compiler input, not consumed by installed workflow.                                          |
| vercel-optimize                    | current           | vercel-labs/agent-skills                                          | 95ae2683b30d892d165af92a350c5628b68106f395a59b448857b654e306ed91 | All installed guidance and support content matches reviewed source after trusted repository formatting. Optional metadata.json is catalog/compiler input, not consumed by installed workflow.                                          |
| vercel-react-best-practices        | current           | vercel-labs/agent-skills                                          | e23951b8cad2f4b1e7e176c5731127c1263fe86f                         | Entrypoint and rule tree match reviewed source after formatting. Compiled guide differs only by excluding the Radix package example from a generic barrel-import list for Core Base UI compatibility. Optional metadata.json is sou... |
| vercel-react-native-skills         | current           | vercel-labs/agent-skills                                          | 4012750a5ccbe064ca04af3835d5d1b011979d2d09d9b6df1c8128fac58e0a66 | All installed guidance and support content matches reviewed source after trusted repository formatting. Optional metadata.json is catalog/compiler input, not consumed by installed workflow.                                          |
| vercel-react-view-transitions      | updated           | vercel-labs/agent-skills                                          | 73140fc5b3a214ad3222bcf557b397b3c02d11c1                         | Entrypoint and all five topic references are already current after formatting. Replaced stale compiled AGENTS.md with the reviewed current guide, preserving source references and Core version/design authority. Rebased 27 upstre... |
| verify-this                        | current           | cursor/plugins                                                    | c1c7b27c1133085bd3409c601ea12b6e6f61b4b23debcd52bc248fc01907e7de | Complete installed payload matches reviewed source after repository formatting; local provenance or Core sync notes are retained.                                                                                                      |
| vitest                             | current           | antfu/skills                                                      | d0c470a07b90936ca77fea9fbe25ab657a5bc1f386eb45b18bb70899df7e6baf | Core-authored installed Vitest 5.0.5 adapter, checked against package manifests and committed harness; generic upstream reference tree is intentionally not vendored.                                                                  |
| wayfinder                          | updated           | mattpocock/skills                                                 | 5beb35b040e3de97e54fa9e386d7e42d15c295c2                         | Existing discovery metadata and explicit-only flags preserved; Existing marked Core overlays and compatibility corrections retained; Refresh does not execute imported scripts/assets; explicit synthetic tests validate reviewed h... |
| web-design-guidelines              | current           | vercel-labs/agent-skills                                          | f4647ca866a3accf763777f83e7682954f0187cd6bea7eea0399796652414e8f | Complete installed payload matches reviewed source after repository formatting; local provenance or Core sync notes are retained.                                                                                                      |
| webapp-testing                     | current           | anthropics/skills                                                 | 51b7349e77ec63b7744a6f63647e7566a0b4d2e301121cc10e8c2113af6556a2 | Existing source matches reviewed upstream after repository formatting; retain Core overlays.                                                                                                                                           |
| weekly-review                      | current           | cursor/plugins                                                    | b56a2c283916b4551aeb322398ab99a19b4b5d7678ffd7f9c9f3df9fa05f4712 | Complete installed payload matches reviewed source after repository formatting; local provenance or Core sync notes are retained.                                                                                                      |
| what-did-i-get-done                | current           | cursor/plugins                                                    | 479813c9abaacb5b6b0531f1de7dc5eb2f3bd9673707a992d1073335836e82f8 | Complete installed payload matches reviewed source after repository formatting; local provenance or Core sync notes are retained.                                                                                                      |
| wizard                             | updated           | mattpocock/skills                                                 | 5beb35b040e3de97e54fa9e386d7e42d15c295c2                         | Existing discovery metadata and explicit-only flags preserved; Existing marked Core overlays and compatibility corrections retained; Refresh does not execute imported scripts/assets; explicit synthetic tests validate reviewed h... |
| workflow-from-chats                | current           | cursor/plugins                                                    | b568176390165921c5e351cc73b553e3e997f92c9f85dfb1c5a220c943fbaa16 | Complete installed payload matches reviewed source after repository formatting; local provenance or Core sync notes are retained.                                                                                                      |
| write-swift                        | updated           | emilkowalski/skills                                               | 2d228630ba1446365f614a108cb8252f1feda202                         | Existing discovery metadata and explicit-only flags preserved; Existing marked Core overlays and compatibility corrections retained; Refresh does not execute imported scripts/assets; explicit synthetic tests validate reviewed h... |
| writing-beats                      | current           | mattpocock/skills                                                 | a96abafa2372eede8267d770138b322d6125da8adaa7ccf0a5e08e4ee13ee71e | Existing source matches reviewed upstream after repository formatting; retain Core overlays.                                                                                                                                           |
| writing-fragments                  | current           | mattpocock/skills                                                 | 298b0edd23df229183630de592ed8aa4289233560f2040691f6eb77caeaad4ea | Existing source matches reviewed upstream after repository formatting; retain Core overlays.                                                                                                                                           |
| writing-great-skills               | retained-snapshot | mattpocock/skills                                                 | 4d6ccbc3760b1bd4107c495a79872286ea69494003f3b0a719fc95b147457061 | Removed upstream; uninstalled writing-for-agents successor is not adopted.; Installed source path is absent from current upstream tree; retain existing snapshot without a freshness claim.                                            |
| writing-shape                      | current           | mattpocock/skills                                                 | f5e6c57bdd85178ace4a260c92f46da6b64ddee18215b461d875739c68976f72 | Existing source matches reviewed upstream after repository formatting; retain Core overlays.                                                                                                                                           |

### Recovery and future refresh

Review the exact source, companions, applicable license and Core adaptations before publishing.
Source-group failures restore directories and lock/companion files together; retain recovery copies after incomplete rollback. Ecosystem refreshes replace only reviewed .agents source directories, then sync every client. Never run blanket installers or paid activation to manufacture a freshness claim. Check native invocation policy as well as SKILL frontmatter.

<!-- AL-2186-AUDIT-END -->

## Verification and delivery - AL-2186

- Full repository preflight passed before PR publication: 915 test files and
  7,621 tests passed, with one expected failure and four skipped tests.
  Application builds, workspace typechecks, formatting, OpenSpec, ownership,
  lockfile and shared UI checks passed.
- All 65 reviewed Cloudflare validator tests passed explicitly under WSL Node.
  Refresh regression tests cover immutable pins, missing/symlinked companions,
  overlay preservation, stale-file removal, directory/lock rollback, vendor
  configuration non-execution and fixture Git-state isolation.
- Mirror verification preserved the full tracked and untracked non-ignored
  project-file fingerprint. All twelve PDF payload files in each of three
  runtime trees retained their baseline SHA-256 digests.
- Independent source/tooling reviews covered the complete authoring diff;
  generated mirrors were verified from those sources. Shadscan remained 48/100.
  Only eight root-manifest proof hashes changed after adding the refresh script;
  findings, classifications and thresholds were preserved.
- PR review identified an Impeccable launcher permission regression. Restored
  its reviewed executable mode and added permission-aware refresh, sync and
  non-mutating mirror checks. A complete upstream mode audit found no other
  executable losses in the updated support trees.
- Additional PR review repairs preserve raw bundle provenance, distinguish
  historical snapshots from availability checks, keep generated Inngest review
  notes, and align the shared class helper with installed cn@0.4.0.
- Imported frontend helper repairs render chart/caption labels as text and use
  generated scene filenames. Browser inspection requires an explicit dev-server
  URL; the tools do not start a server over repository files. Exact source hashes
  and Core templates preserve these repairs through refresh without executing
  imported code. ReUI metadata rejects unsafe Unicode scalars and display controls.
- [PR #2187](https://github.com/Asymmetric-al/core/pull/2187) tracks exact-head
  hosted CI and review state. Optional provider availability is reported there
  separately from repository checks and independent source review.

For future source edits, update the affected record's evidence and final hashes
in skill-source-audit.json together with provenance and mirrors. Its dated
imported/examined revisions are evidence, not fields to infer from another skill.
Use the documented hash algorithm; do not relabel an unreviewed source current
merely to make an integrity assertion pass.

## Scope

This log records the audit and full upstream refresh of the
Asymmetric-al/core agent skill system:

- Canonical skills under `docs/ai/skills/*/SKILL.md`
- Runtime mirrors under `.agents/skills/*`, `.cursor/skills/*`, and
  `.claude/skills/*`
- Skills CLI lock metadata in `skills-lock.json`
- Skill sync, verification, and upstream refresh scripts
- Supporting CLI/MCP guidance for agent workflows

## Source-of-Truth Pattern

- Canonical repo skills are authored under `docs/ai/skills/*`.
- `.agents/skills/*`, `.cursor/skills/*`, and `.claude/skills/*` are committed
  runtime mirrors.
- `scripts/sync-agent-skills.mjs` overlays canonical skills into all three
  runtime roots, records canonical file ownership in
  `.repo-canonical-skills.json`, prunes stale canonical-owned files (including
  files from removed canonical skills), and mirrors all `.agents/skills/*`
  entries into `.cursor/skills/*` and `.claude/skills/*` while preserving
  runtime-only assets.
- `scripts/verify-skills-sync.mjs` runs the sync script and fails on tracked or
  untracked mirror drift.
- `scripts/refresh-upstream-skills.mjs` vendors selected configured sources,
  including Supabase, `npm-deps-cleanup`, animations.dev
  `emil-design-engineering`, `emilkowalski/skills`,
  `nicobailon/grill-for-unknowns`, Cursor Team Kit skills, and the Babysitter
  `babysit` skill into `docs/ai/skills/*`.

## Baseline

Branch: `chore/skills-upstream-refresh` from `origin/production`.

- Baseline `bun run skills:verify`: pass.
- Baseline canonical skills: 26 expected in `docs/ai/skills/*`.
- Baseline lockfile-managed skills: 24 entries in `skills-lock.json`.
- Nia repo-scoped search was attempted, but the indexed snapshot returned stale
  paths and missed current `skills-lock.json`, `.mcp.json`, and skill scripts.
  Current local repository files are the evidence source for this refresh.

## Refresh Log

Completed 2026-06-26:

- Updated `docs/ai/working-set.md` with the Cursor Team Kit and Babysitter
  skill-vendoring scope.
- Verified upstream branches:
  - `cursor/plugins` default branch `main` at
    `0452e08a314c03621ec5ac1324f1ad1dd824f1a4`.
  - `a5c-ai/babysitter-cursor` default branch `develop` at
    `67f78eaae0935c93fb0ff5b51f471d819eab0134`.
- Vendored all current Cursor Team Kit skills from
  `cursor-team-kit/skills/*` into `docs/ai/skills/*`:
  `check-compiler-errors`, `control-cli`, `control-ui`, `deslop`, `fix-ci`,
  `fix-merge-conflicts`, `get-pr-comments`, `loop-on-ci`,
  `make-pr-easy-to-review`, `new-branch-and-pr`, `pr-review-canvas`,
  `review-and-ship`, `run-smoke-tests`,
  `thermo-nuclear-code-quality-review`, `verify-this`, `weekly-review`,
  `what-did-i-get-done`, and `workflow-from-chats`.
- Vendored Babysitter `skills/babysit/SKILL.md` into
  `docs/ai/skills/babysit/`, plus upstream `versions.json` because the
  repository adaptation reads its reviewed `sdkVersion` from the canonical
  repo-local copy. Resolution fails closed when that file or exact version is
  unavailable or unsafe, and the CLI runs the validated pin through `npx`
  without a global install.
- Added `references/upstream.md` to every new canonical skill directory with
  `source_name`, `source_url`, `source_type: github`, `upstream_path`,
  `skills_lock_hash`, `last_reviewed`, reviewed commit, and refresh steps.
- Updated `skills-lock.json` with 19 new `sourceType: "github"` entries using
  SHA-256 hashes of the upstream `SKILL.md` bytes.
- Extended `scripts/refresh-upstream-skills.mjs` with safe GitHub temp-clone
  source groups for Cursor Team Kit and Babysitter. The script now validates
  skill slugs, verifies upstream `SKILL.md` exists before deleting canonical
  targets, preserves `references/upstream.md`, regenerates metadata, copies
  configured support files, and updates matching lockfile entries.
- Copied Cursor Team Kit companion agents into `.cursor/agents/ci-watcher.md`
  and `.cursor/agents/thermo-nuclear-code-quality-review.md`.
- Intentionally did not vendor Cursor Team Kit upstream `.cursor/rules`
  (`no-inline-imports.mdc`, `typescript-exhaustive-switch.mdc`) because no
  skill depends on them and both are `alwaysApply` repo-wide Cursor behavior
  changes.

Completed 2026-05-23:

- Created branch `chore/skills-upstream-refresh` from `origin/production`.
- Updated `docs/ai/working-set.md` with this refresh scope.
- Ran `npx skills add supabase/agent-skills -y`.
- Ran `npx skills add anthonyshew/dotfiles -y`.
- Ran `npx skills add mattpocock/skills -y`.
- Ran `npx skills add nolly-studio/components-build-skill -y`.
- Ran `npx skills add ueberdosis/tiptap -y`.
- Tried `npx skills add docs.stripe.com -y`; it failed because
  `docs.stripe.com` is not a Git repository. The local Cursor Stripe plugin
  cache matched the committed Stripe skill content.
- Ran `bun run skills:refresh-upstream`; reran with `HOME=$env:USERPROFILE` so
  the Windows shell could resolve `~/.cursor/skills/emil-design-engineering`.
- Promoted AGENTS-routed Matt Pocock skills into `docs/ai/skills/*`:
  `setup-matt-pocock-skills`, `grill-with-docs`, `grill-me`, `diagnose`,
  `zoom-out`, `to-prd`, `to-issues`, `improve-codebase-architecture`, `tdd`,
  `qa`, `request-refactor-plan`, `setup-pre-commit`, `migrate-to-shoehorn`,
  `ubiquitous-language`, plus repo aliases `domain-model` and `prd-to-plan`.
- Ran `npx skills add payloadcms/skills -y`; vendored `payload` and
  `cms-migration` into canonical `payloadcms-payload` and
  `payloadcms-cms-migration` with repo overlays.
- Ran `npx skills add resend/resend-cli -y`; vendored the refreshed
  `resend-cli` tree into canonical `docs/ai/skills/resend-cli`.
- Tried `npx skills add bendc/frontend-guidelines -y`; it found no `SKILL.md`.
  Refreshed `bendc-frontend-guidelines` manually from upstream `README.md`.
- Ran `npx skills add vercel-labs/agent-skills -y`; vendored refreshed
  `vercel-react-best-practices` and `vercel-react-view-transitions` into
  canonical docs.
- Ran `npx skills find` for high-value mirror-only skills and refreshed clear
  upstream sources with:
  - `npx skills add vercel-labs/agent-browser@agent-browser -y`
  - `npx skills add shadcn-ui/ui@shadcn -y`
  - `npx skills add resend/resend-skills -y`
  - `npx skills add resend/react-email@react-email -y`
  - `npx skills add vercel/turborepo@turborepo -y`
  - `npx skills add antfu/skills@vitest -y`
  - `npx skills add vercel-labs/next-skills -y`
  - `npx skills add kadajett/agent-nestjs-skills@nestjs-best-practices -y`
  - `npx skills add testdino-hq/playwright-skill@playwright-skill -y`
  - `npx skills add anthropics/skills@webapp-testing -y`
  - `npx skills add obra/superpowers@test-driven-development -y`
- Ran `bun run skills:sync` after canonical promotions and manual vendor
  updates.
- Fixed Windows CI build execution by running Turbo through `bunx turbo` in
  `scripts/verify/ci-build.mjs` and making `scripts/run-with-ci-env.mjs`
  shell-aware for Windows command execution.

## Resulting Inventory

After the 2026-06-26 addition:

- Canonical skills: 62 under `docs/ai/skills/*`.
- Runtime mirror skills: 122 under `.agents/skills/*` and `.cursor/skills/*`.
- New Cursor Team Kit canonical skills: 18.
- New Babysitter canonical skills: 1.
- Skills lock entries: 75 in `skills-lock.json`.
- Cursor Team Kit companion agents: 2 under `.cursor/agents/`.
- Cursor Team Kit upstream rules: found and intentionally not vendored.

After the 2026-05-23 refresh:

- Canonical skills: 42 under `docs/ai/skills/*`.
- Runtime mirror skills: 102 under `.agents/skills/*`.
- Skills CLI lock entries: 55 in `skills-lock.json`.
- New canonical sources promoted or added in this refresh:
  - Matt Pocock pack: 16 canonical directories including aliases.
  - Payload CMS: `payloadcms-payload`, `payloadcms-cms-migration`.
  - `bendc-frontend-guidelines`.

## Known Gaps

- The animations.dev installer was not rerun with a maintainer email. The
  refresh used the currently installed local `~/.cursor/skills/emil-design-engineering`
  source after setting `HOME` for PowerShell.
- Resolved by the runtime modernization checkpoint: the earlier floating Next
  DevTools help probe established dependency resolution only. The exact
  `next-devtools-mcp@0.4.0` launcher now passes real STDIO negotiation and tool
  listing. Qualify future bumps through
  `docs/maintenance/modernization/runtime-infrastructure-inventory.json`.
- Several mirror-only skills have ambiguous public search results. The refresh
  updated clear upstream sources and left ambiguous/plugin-only skills as
  runtime mirrors.
- Nia's indexed repo snapshot remained stale relative to the working tree.
- `npx skills check` remains unsafe as a read-only command in this repo. With
  `skills@1.5.7`, it was not listed in `npx skills --help` and was observed to
  mutate `.agents/skills/*` and `skills-lock.json`.

## Validation Log

Completed 2026-05-23:

- `bun run skills:sync` — pass
- `bun run skills:verify` — pass
- `bun run format:check` — pass
- `bun run build` — pass after the Windows Turbo runner fix
- `bun run test:unit` — pass after raising the donor Next config dynamic import
  test timeout to 15 seconds
- `bun run ci:preflight` — pass

## 2026-06-28 — eve + ecosystem skills

Branch: `chore/add-eve-and-ecosystem-skills` from `origin/production`.

- Installed via Skills CLI: `eve`, `create-agent`, `impeccable` (upstream id; requested `critique` is not published), `playwright-best-practices`, `codebase-design`, refreshed `setup-pre-commit`.
- Promoted new skills into canonical `docs/ai/skills/*` with `references/upstream.md`.
- Updated `AGENTS.md` Skill Routing and ran `bun run skills:sync`.

## 2026-07-09 - Matt Pocock v1.1 engineering refresh

- Ran `npx skills add mattpocock/skills -y` as requested. The Skills CLI
  discovered 38 skills and refreshed `.agents/skills/*` plus
  `skills-lock.json`.
- Checked current upstream `skills/engineering/` from a fresh upstream checkout.
  Current engineering skills are:
  `ask-matt`, `codebase-design`, `code-review`, `diagnosing-bugs`,
  `domain-modeling`, `grill-with-docs`, `implement`,
  `improve-codebase-architecture`, `prototype`, `research`,
  `resolving-merge-conflicts`, `setup-matt-pocock-skills`, `tdd`,
  `to-spec`, `to-tickets`, `triage`, and `wayfinder`.
- Promoted current engineering skills into canonical `docs/ai/skills/*`, plus
  `grilling` because the current engineering skills invoke it.
- Refreshed existing Core-promoted Matt skills still published upstream:
  `grill-me`, `migrate-to-shoehorn`, `qa`, `request-refactor-plan`,
  `setup-pre-commit`, and `ubiquitous-language`.
- Removed stale renamed upstream routes from canonical and mirror roots:
  `diagnose`, `to-prd`, `to-plan`, `to-issues`, and `zoom-out`. Use
  `diagnosing-bugs`, `to-spec`, `to-tickets`, `ask-matt`, or `wayfinder`
  instead.
- Kept Core repo-local compatibility skills `domain-model` and `prd-to-plan`,
  but updated them to route to `domain-modeling` and `to-spec`/`to-tickets`.
- Kept the full current Skills CLI install set as mirror-only ecosystem skills
  under `.agents/skills/`, `.cursor/skills/`, and `.claude/skills/` so Cursor,
  Claude Code, and Codex see the same package output.
- Removed obsolete prior Matt installs `caveman` and `write-a-skill` because
  the current `npx skills add mattpocock/skills -y` output no longer includes
  them. Use current upstream `writing-great-skills` for skill-writing guidance.

## 2026-07-11 - Emil Kowalski design-engineering pack

- Confirmed live upstream `emilkowalski/skills` at
  `7bb7061b5cf7de15ea1aeaf00fbd9e6592a20fce` contains exactly five skills:
  `animation-vocabulary`, `apple-design`, `emil-design-eng`,
  `improve-animations`, and `review-animations`.
- Ran `npx --yes skills@latest add emilkowalski/skills -y`; the Skills CLI
  installed all five complete trees into `.agents/skills/` and recorded them in
  `skills-lock.json`.
- Promoted the complete trees into `docs/ai/skills/`, including
  `improve-animations/{AUDIT.md,PLAN-TEMPLATE.md}` and
  `review-animations/STANDARDS.md`.
- Preserved the upstream MIT notice, pack commit, per-skill source path, and
  focused refresh workflow beside every canonical skill.
- Added marked Core overlays so `docs/ai/rules/frontend.md`, Base UI, shared
  motion tokens, global reduced-motion behavior, and existing routing remain
  authoritative.
- Added `bun run skills:refresh-emilkowalski` for focused future updates.
- Extended the canonical manifest with per-skill file ownership so removed
  companion files cannot remain stale in Codex, Cursor, or Claude Code while
  runtime-only assets remain intact.
- Added an OpenSpec change and focused parity/regression tests for the durable
  workflow update.

## 2026-07-12 - Grill for Unknowns

- Confirmed live upstream `nicobailon/grill-for-unknowns` at
  `dc132fc8be26529579cff896e7618550d0d9736b` contains one version `0.1.1`
  skill with ten interdependent plugin files.
- Ran `npx --yes skills@latest add nicobailon/grill-for-unknowns -y`; the
  Skills CLI installed the complete tree into `.agents/skills/` and recorded
  its source path and content hash in `skills-lock.json`.
- Promoted the complete plugin tree into
  `docs/ai/skills/grill-for-unknowns/`, retaining the upstream README, MIT
  license, lineage references, and all five templates.
- Added pinned Core provenance, explicit-only discovery metadata, and a marked
  overlay that keeps OpenSpec, source evidence, canonical domain-modeling
  formats, and user-authorized mutation scope authoritative.
- Added `bun run skills:refresh-grill-for-unknowns` for focused future updates
  and documented non-overlapping routing with `grilling`, `grill-with-docs`,
  `grill-me`, and `wayfinder`.
- Made the focused refresh fail before canonical mutation when upstream
  frontmatter drifts beyond the reviewed explicit-only compatibility transform.
- Added a dedicated OpenSpec change and focused cross-runtime parity tests.

## 2026-07-13 - Cursor Team Kit / Babysitter merge reconciliation

- Reconciled the Cursor Team Kit + Babysitter vendoring (2026-06-26 entry
  above) with the reorganized skills system: the GitHub temp-clone source
  groups in `scripts/refresh-upstream-skills.mjs` now stage every skill in a
  group and reuse the same atomic swap/backup machinery as local sources, so
  a failed refresh never leaves canonical copies, companion agents, or
  `skills-lock.json` out of sync.
- Added a deterministic `treeHash` (sorted relative path + bytes over the
  whole vendored skill directory, excluding the generated
  `references/upstream.md`) next to `computedHash` in `skills-lock.json` for
  the 19 GitHub-vendored skills, so support files like `versions.json` and
  the `pr-review-canvas` renderer assets are covered by the lock, not only
  `SKILL.md`.
- Fixed `pr-review-canvas` SKILL.md instructions (review findings): the diff
  placeholder swap now uses a formatting-tolerant `re.sub` on the
  `pr-diffs-json` script element (the literal
  `{"__PR_DIFFS_PLACEHOLDER__":true}` string never matched the
  Prettier-reflowed template), and diff keys are exact PR filenames instead
  of the lossy `gsub("[^a-zA-Z0-9]"; "_")` normalization that could collide
  distinct files. Both fixes are pinned as required
  `POST_REFRESH_REPLACEMENTS` so future refreshes fail loudly on upstream
  drift instead of silently reverting them.

## 2026-08-29 - Emil Kowalski pack and paid skill refresh

- Confirmed live upstream `emilkowalski/skills` at
  `d23d7f88a2e21c9e4b1418c7abe420f5c1052ba7` now ships twelve public skills.
  Core lockfile-manages eleven of them (`animate`, `animate-expo`,
  `animation-vocabulary`, `apple-design`, `ask-sonner`, `emil-design-eng`,
  `emil-prototype`, `improve-animations`, `pick-ui-library`,
  `review-animations`, `write-swift`) and keeps the Core-authored
  `find-animation-opportunities` adapter.
- Copied the pack into `.agents/skills/` instead of running
  `npx skills add emilkowalski/skills -y`, which would overwrite Matt Pocock
  `prototype` and the Core animation-opportunity adapter. Upstream
  `skills/prototype/` is vendored as `emil-prototype`.
- Refreshed the paid animations.dev skill **`emil-design-engineering`**
  (`$99`) from `https://animations.dev` into
  `~/.cursor/skills/emil-design-engineering/`, then
  `bun run skills:refresh-upstream --only=animations.dev`.
- Added Core overlays, MIT provenance, and routing for the six new public
  skills. Existing Base UI, motion-token, and reduced-motion overlays remain
  authoritative.

## 2026-09-16 - Design skill packs and Emil refresh

- Confirmed live upstream `emilkowalski/skills` at
  `85e8e2363b713506e1d5b6e07a0eb2da66be1bc3`. Added the new public
  `mobile-native` skill and refreshed the rest of the lockfile-managed pack.
  Kept Core's `find-animation-opportunities` adapter and Matt Pocock
  `prototype`.
- Refreshed the paid animations.dev skill **`emil-design-engineering`**
  (`$99`) from `https://animations.dev` into
  `~/.cursor/skills/emil-design-engineering/`, then
  `bun run skills:refresh-upstream --only=animations.dev`.
- Vendored Jakub Krehel polish skills (`better-ui`, `better-typography`,
  `better-colors`, `better-layout`, `better-interface`, `better-accessibility`,
  `better-writing`, `interface-review`), Anthropic `frontend-design`,
  leonxlnx `design-taste-frontend` / `redesign-existing-projects`, and obra
  Superpowers `test-driven-development`. `better-writing` is included because
  `better-interface` depends on it. Did not vendor unlisted Jakub skills
  (`break`, `variant`, `explain-interface`).
- Marked `interface-review`, `frontend-design`, `design-taste-frontend`, and
  `redesign-existing-projects` explicit-only. Overlays keep Base UI /
  `base-maia` authoritative; these skills must not restyle Core product apps.
- Core TDD remains `docs/ai/skills/tdd/SKILL.md`; obra TDD is a companion.
  Core a11y remains `docs/ai/skills/accessibility-review/SKILL.md`.
- Added focused refresh scripts: `skills:refresh-jakubkrehel`,
  `skills:refresh-frontend-design`, `skills:refresh-taste-skill`,
  `skills:refresh-obra-tdd`.

## 2026-09-16 - Full catalog freshness audit

- Audited every lockfile-managed skill (128 original names) against live
  GitHub `SKILL.md` bytes. True content refreshes were applied; overlay,
  Prettier, OpenSpec `v1.9.0` pin, and Core-adapter diffs were not treated as
  stale upstream.
- Kept OpenSpec skills on installed CLI `@fission-ai/openspec@1.9.0`. Did not
  bump to upstream `v1.13.0`. Frozen OpenSpec changes stay frozen.
- Refreshed Cursor Team Kit at `c1c0a328`, Babysitter `babysit` from default
  branch `main` at `baae1ad6` (fail-closed npm-exec, no `latest` fallback),
  and `grill-for-unknowns` 0.1.3 at `d8d5f4b`. Grill lock `computedHash`
  tracks canonical overlayed `SKILL.md` bytes.
- Realigned lockfile hashes to GitHub-raw `SKILL.md` SHA-256 where the local
  tree already matched HEAD (CLI `computedHash` is not the repo convention).
  Left Prettier-formatted Team Kit skills, overlayed canonical skills, the
  OpenSpec pin, and Core adapters (`prototype`, `vitest`, `tdd`,
  `emil-prototype`) on their existing hashes.
- Promoted moved GitHub paths without growing the lockfile: `vercel/eve`
  `skills/eve/SKILL.md`, `playwright-best-practices/SKILL.md`,
  `skills/nestjs-best-practices/SKILL.md` (NestJS reference only; no
  NestJS/TypeORM in Core), `resend/resend-cli` at v2.21.0. `playwright-skill`
  stays lockfile + `.agents` only.
- `create-agent` stays a kept snapshot (`ikindacodes/ship-eve` no longer
  publishes `skills/`).
- Matt Pocock HEAD removed `design-an-interface`, `edit-article`,
  `obsidian-vault`, `qa`, `request-refactor-plan`, `ubiquitous-language`, and
  `writing-great-skills`. Canonical copies stay as kept snapshots. Did not
  vendor successor `writing-for-agents`.
- Inngest refresh now vendors `inngest-api-cli` and `rest-api-v2.md` /
  `cli-commands.md`; retired `agent-friction.md`. Pins unchanged.
- Payload reference files already matched HEAD; SKILL.md differs only by Core
  overlay. bendc README wrapper reviewed 2026-09-16.
- Restored marked and unmarked Core overlays on promote. `skills:sync` /
  `skills:verify` rewrite runtime mirrors after CLI adds.
- Restored the marked ask-matt grill-depth overlay so `/grill-for-unknowns`
  stays on the main flow after the Matt CLI body refresh. NestJS overlay
  keeps `not a NestJS application` on one line. Anthropic `frontend-design`
  now vendors root `LICENSE.txt` instead of `references/LICENSE.md`.
- Vendored NestJS, Playwright, and Payload reference docs keep
  `pragma: allowlist secret` on credential-example lines, and those trees
  are Prettier-ignored so wrapping does not re-trip the commit scanner.
- `skills:sync` now allowlists those same credential-example lines in
  ecosystem `.agents` copies (including JSON string values) before mirroring
  to Cursor and Claude, so lockfile-only skills stay committable after CLI
  refresh. `skills:refresh-upstream` walks every copied canonical file, not
  only `better-accessibility` / `better-writing`.
- Follow-up 2026-09-16: restore `disable-model-invocation: true` in
  Anthropic `frontend-design` YAML frontmatter (overlay prose was not
  enough). Remap ask-matt `/writing-for-agents` to kept
  `/writing-great-skills`; add `skills:refresh-ask-matt` without vendoring
  the successor. `skills:sync` now skips and prunes macOS Finder junk
  (`Archive.zip`, `__MACOSX`, `.DS_Store`, `._*`) from ecosystem copies.

## Rollback Notes

If mirror files drift, rerun:

```bash
bun run skills:sync
bun run skills:verify
```

For a failed upstream refresh, revert the changed canonical skill directories,
`skills-lock.json`, `AGENTS.md`, `README.md`, and `docs/AI_AGENT_PLAYBOOK.md`,
then rerun `bun run skills:sync`.

## 2026-10-22 — Payload public-v4 adapters

The canonical Payload application and CMS-import skills now use `payload` and `cms-migration`, matching their installed identities. This supersedes the historical `payloadcms-payload` / `payloadcms-cms-migration` aliases recorded above. Core's OpenSpec, backend, Supabase, data-access, and design-system overlays remain authoritative. The outdated generic v3 manuals are removed from active routing and mirrors; versioned public-v4 guidance and installed declarations replace them. Reviewed upstream commit, removed-file hashes, and migration provenance are recorded in [payload-skill-provenance.json](../maintenance/modernization/payload-skill-provenance.json).
