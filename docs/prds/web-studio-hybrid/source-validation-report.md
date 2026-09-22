Historical research/validation evidence from the supplied source package. It does not establish current repository or provider state. Current planning ownership is in [README](README.md).

<a id="web-validation"></a>

# Actual validation report

> **Integration note:** This is the original package report, preserved in full. Current local fixture reruns and Markdown-preservation checks are reported separately in [Verification](../program-roadmap/source-2026-09-22/supplied-roadmap.md#verification); the Core runtime qualification gates remain open.

```text
ASYM WEB STUDIO — SPECIFICATION VALIDATION REPORT
Date: 2026-09-12
Change: add-web-studio-hybrid-authoring

ACTUALLY EXECUTED
- Python JSON Schema and reference state-model tests, local research container.
- Local requirement/workflow/automation/task/evidence ID integrity.
- Scenario completeness, inverse traceability, acyclic task dependency graph.
- Local Markdown file-link targets and JSON parsing.

NOT EXECUTED / NOT CLAIMED
- Core application builds, typechecks, lint or repository-pinned OpenSpec CLI.
- Supabase/PostgreSQL/Payload transaction, RLS or integration proof.
- Actual Puck adapter round-trip, cross-origin rendering or browser tests.
- GitHub installation/webhooks/credentials integration or deployment.
- Production load/cost/security or moderated staff/developer tests.
- Repository file, issue, PR, dependency, schema, credential or production writes.

These passing checks establish consistency of the proposed specification and
its structural examples. They do not establish product correctness, runtime
compatibility, production readiness or founder adoption of new detailed scope.
All implementation task boxes remain unchecked. Q01–Q09 remain mandatory.

SPECIFICATION CHECKS
ASym Web Studio specification structural validation
Scope: documentation, JSON, links and traceability only. No Core runtime/OpenSpec CLI/provider/browser proof.
Workflows=18 Automations=12 Requirements=48 Scenarios=96 Tasks=27 Evidence=50
Checks passed: 378; failures: 0
PASS: all checked specification relationships are consistent.

REFERENCE TEST OUTPUT
test_key_changed_payload_denied (test_contracts.ReferenceStateSemantics.test_key_changed_payload_denied) ... ok
test_new_draft_does_not_mutate_candidate (test_contracts.ReferenceStateSemantics.test_new_draft_does_not_mutate_candidate) ... ok
test_original_input_cannot_mutate_saved_content (test_contracts.ReferenceStateSemantics.test_original_input_cannot_mutate_saved_content) ... ok
test_precommit_failure_has_no_effect (test_contracts.ReferenceStateSemantics.test_precommit_failure_has_no_effect) ... ok
test_revocation_before_receipt_read (test_contracts.ReferenceStateSemantics.test_revocation_before_receipt_read) ... ok
test_same_request_replays_once (test_contracts.ReferenceStateSemantics.test_same_request_replays_once) ... ok
test_stale_lease_denied (test_contracts.ReferenceStateSemantics.test_stale_lease_denied) ... ok
test_stale_revision_denied (test_contracts.ReferenceStateSemantics.test_stale_revision_denied) ... ok
test_allowed_root_stack_grid (test_contracts.StructuralContracts.test_allowed_root_stack_grid) ... ok
test_allowed_root_stack_split (test_contracts.StructuralContracts.test_allowed_root_stack_split) ... ok
test_arbitrary_setting_value (test_contracts.StructuralContracts.test_arbitrary_setting_value) ... ok
test_article_no_layouts (test_contracts.StructuralContracts.test_article_no_layouts) ... ok
test_bad_manifest_digest (test_contracts.StructuralContracts.test_bad_manifest_digest) ... ok
test_byte_limit (test_contracts.StructuralContracts.test_byte_limit) ... ok
test_class_name_rejected (test_contracts.StructuralContracts.test_class_name_rejected) ... ok
test_duplicate_node_id (test_contracts.StructuralContracts.test_duplicate_node_id) ... ok
test_empty_slot_saved_but_not_published (test_contracts.StructuralContracts.test_empty_slot_saved_but_not_published) ... ok
test_forged_actor_in_save (test_contracts.StructuralContracts.test_forged_actor_in_save) ... ok
test_future_semantic_version (test_contracts.StructuralContracts.test_future_semantic_version) ... ok
test_grid_nested_layout (test_contracts.StructuralContracts.test_grid_nested_layout) ... ok
test_grid_slot_max (test_contracts.StructuralContracts.test_grid_slot_max) ... ok
test_hero_nested (test_contracts.StructuralContracts.test_hero_nested) ... ok
test_hero_not_first (test_contracts.StructuralContracts.test_hero_not_first) ... ok
test_manifest_secret_rejected (test_contracts.StructuralContracts.test_manifest_secret_rejected) ... ok
test_max_root_entries (test_contracts.StructuralContracts.test_max_root_entries) ... ok
test_publish_structure_with_reuse_count (test_contracts.StructuralContracts.test_publish_structure_with_reuse_count) ... ok
test_raw_css_setting (test_contracts.StructuralContracts.test_raw_css_setting) ... ok
test_reuse_expansion_bound (test_contracts.StructuralContracts.test_reuse_expansion_bound) ... ok
test_reuse_nested (test_contracts.StructuralContracts.test_reuse_nested) ... ok
test_reuse_requires_resolved_count_for_publish (test_contracts.StructuralContracts.test_reuse_requires_resolved_count_for_publish) ... ok
test_second_hero (test_contracts.StructuralContracts.test_second_hero) ... ok
test_split_inside_split (test_contracts.StructuralContracts.test_split_inside_split) ... ok
test_split_stack_mixed_with_leaf (test_contracts.StructuralContracts.test_split_stack_mixed_with_leaf) ... ok
test_stack_inside_stack (test_contracts.StructuralContracts.test_stack_inside_stack) ... ok
test_stack_slot_max (test_contracts.StructuralContracts.test_stack_slot_max) ... ok
test_third_container_level (test_contracts.StructuralContracts.test_third_container_level) ... ok
test_total_node_max (test_contracts.StructuralContracts.test_total_node_max) ... ok
test_unauthorized_event_payload (test_contracts.StructuralContracts.test_unauthorized_event_payload) ... ok
test_unknown_node_kind (test_contracts.StructuralContracts.test_unknown_node_kind) ... ok
test_unknown_semantics (test_contracts.StructuralContracts.test_unknown_semantics) ... ok
test_v1_no_layouts (test_contracts.StructuralContracts.test_v1_no_layouts) ... ok
test_v2_ceiling_not_retroactive_v1 (test_contracts.StructuralContracts.test_v2_ceiling_not_retroactive_v1) ... ok
test_valid_article (test_contracts.StructuralContracts.test_valid_article) ... ok
test_valid_event (test_contracts.StructuralContracts.test_valid_event) ... ok
test_valid_manifest (test_contracts.StructuralContracts.test_valid_manifest) ... ok
test_valid_save (test_contracts.StructuralContracts.test_valid_save) ... ok
test_valid_v1 (test_contracts.StructuralContracts.test_valid_v1) ... ok
test_valid_v2 (test_contracts.StructuralContracts.test_valid_v2) ... ok

----------------------------------------------------------------------
Ran 48 tests in 0.981s

OK

```

---
