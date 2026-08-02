export const EVE_GITHUB_OPERATOR_SESSION_PURPOSES = [
  "github_operator_maintenance",
  "github_operator_product_direction",
] as const;

export type EveGithubOperatorSessionPurpose =
  (typeof EVE_GITHUB_OPERATOR_SESSION_PURPOSES)[number];

export function isEveGithubOperatorSessionPurpose(
  value: unknown,
): value is EveGithubOperatorSessionPurpose {
  return EVE_GITHUB_OPERATOR_SESSION_PURPOSES.some(
    (purpose) => purpose === value,
  );
}

export function isEveGithubProductDirectionPurpose(
  purpose: EveGithubOperatorSessionPurpose,
): boolean {
  return purpose === "github_operator_product_direction";
}
