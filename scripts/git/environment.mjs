/** Clear checkout-local variables before accessing an explicitly selected repository. */
export function repositoryGitEnvironment(env = process.env) {
  // https://git-scm.com/docs/githooks: foreign repositories must not inherit
  // the hook's local Git environment (git rev-parse --local-env-vars).
  const localVariables = new Set([
    "GIT_ALTERNATE_OBJECT_DIRECTORIES",
    "GIT_CONFIG",
    "GIT_CONFIG_PARAMETERS",
    "GIT_CONFIG_COUNT",
    "GIT_OBJECT_DIRECTORY",
    "GIT_DIR",
    "GIT_WORK_TREE",
    "GIT_IMPLICIT_WORK_TREE",
    "GIT_GRAFT_FILE",
    "GIT_INDEX_FILE",
    "GIT_NO_REPLACE_OBJECTS",
    "GIT_REPLACE_REF_BASE",
    "GIT_PREFIX",
    "GIT_SHALLOW_FILE",
    "GIT_COMMON_DIR",
  ]);
  return Object.fromEntries(
    Object.entries(env).filter(([name]) => !localVariables.has(name)),
  );
}
