import {
  CONTRIBUTION_CORRECTION_TEMPLATE_FAMILIES,
  getContributionCorrectionRequiredTags,
  type ContributionCorrectionTemplateFamily,
  type ContributionCorrectionTemplateVariant,
} from "@asym/email/contribution-correction-tags";
import {
  parseMergeTags,
  validateMergeTags,
} from "@asym/email/merge-tag-render";

export function getContributionCorrectionTemplateBinding(
  metadata: Record<string, unknown> | null | undefined,
): {
  family: string;
  variant: string;
} | null {
  const value = metadata?.contributionCorrection;
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    return null;
  }

  const family =
    "family" in value && typeof value.family === "string" ? value.family : null;
  const variant =
    "variant" in value && typeof value.variant === "string"
      ? value.variant
      : null;

  return family && variant ? { family, variant } : null;
}

export function validateContributionCorrectionTemplate(input: {
  family: ContributionCorrectionTemplateFamily;
  variant: string;
  html: string;
  text: string;
  active: boolean;
}) {
  if (
    !isContributionCorrectionTemplateVariantForFamily({
      family: input.family,
      variant: input.variant,
    })
  ) {
    return {
      valid: false,
      errors: ["Unknown contribution correction template variant."],
      missingRequiredTags: [],
      requiredTags: [],
      usedTags: parseMergeTags(`${input.html}\n${input.text}`),
    };
  }

  const variant = input.variant as ContributionCorrectionTemplateVariant;
  const requiredTags = getContributionCorrectionRequiredTags({
    family: input.family,
    variant,
  });
  const usedTags = parseMergeTags(`${input.html}\n${input.text}`);
  const mergeTagValidation = validateMergeTags(`${input.html}\n${input.text}`, {
    messageType: "transactional",
  });
  const missingRequiredTags = requiredTags.filter(
    (tag) => !usedTags.includes(tag),
  );
  const errors = [
    ...mergeTagValidation.errors,
    ...(input.active
      ? missingRequiredTags.map((tag) => `Missing required merge tag: ${tag}`)
      : []),
  ];

  return {
    valid: errors.length === 0,
    errors,
    missingRequiredTags,
    requiredTags,
    usedTags,
  };
}

export function isContributionCorrectionTemplateFamily(
  value: string,
): value is ContributionCorrectionTemplateFamily {
  return value in CONTRIBUTION_CORRECTION_TEMPLATE_FAMILIES;
}

export function isContributionCorrectionTemplateVariantForFamily(input: {
  family: ContributionCorrectionTemplateFamily;
  variant: string;
}): input is {
  family: ContributionCorrectionTemplateFamily;
  variant: ContributionCorrectionTemplateVariant;
} {
  const family = CONTRIBUTION_CORRECTION_TEMPLATE_FAMILIES[input.family];
  return input.variant in family.variants;
}
