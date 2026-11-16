# Design

The guard receives the original caller environment and existing update intent. An allowed preflight child receives a cloned environment with the repository-local Git variables removed through the existing shared helper, including numbered Git configuration overrides. Do not mutate the original environment or replace all environment variables; normal authentication helpers, networking and process context remain available.

The child runs from the actual checkout and discovers that repository normally. A test that deliberately changes into an independently created temporary repository cannot be redirected into the invoking repository by inherited `GIT_DIR`, `GIT_WORK_TREE`, index, object, common-directory or configuration variables.

Use the existing pre-push seam with injected command execution and a real disposable two-repository regression. Prove the original environment is unchanged, production checks use it, denied pushes spawn no command, child exit/error still fails the push, and the parent repository configuration and index remain unchanged. No test runs a destructive fixture against the user's real checkout. The normal complete pre-push preflight remains the final publication check.
