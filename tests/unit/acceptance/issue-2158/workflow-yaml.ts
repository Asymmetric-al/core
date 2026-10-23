/**
 * Issue #2158 acceptance entry point for the shared workflow YAML helpers.
 * The implementation lives in tests/unit/helpers/workflow-yaml.ts so other
 * suites (e.g. tests/unit/scripts/ci-build-policy.test.ts) can share it.
 */
export * from "../../helpers/workflow-yaml";
