import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

const optionalBoolean = z
  .enum(["true", "false"])
  .optional()
  .transform((value) => value === "true");

const optionalBooleanDefaultTrue = z
  .enum(["true", "false"])
  .optional()
  .transform((value) => value === undefined || value === "true");

const nodeEnvSchema = z
  .enum(["development", "test", "production"])
  .optional()
  .default("development");

const vercelEnvSchema = z
  .enum(["production", "preview", "development"])
  .optional();

const pdfStudioNativeBuilderRolloutSchema = z
  .enum([
    "legacy_only",
    "native_preview",
    "native_render_test",
    "native_publish",
    "native_batch",
    "native_default",
  ])
  .optional()
  .default("legacy_only");

const runtimeContext = {
  nodeEnv: nodeEnvSchema.parse(process.env.NODE_ENV),
  vercelEnv: process.env.VERCEL_ENV,
  vercelTargetEnv: process.env.VERCEL_TARGET_ENV,
};

const normalizedTargetEnv = runtimeContext.vercelTargetEnv?.toLowerCase();
const isProtectedDeployment =
  runtimeContext.vercelEnv === "production" ||
  normalizedTargetEnv === "production" ||
  normalizedTargetEnv === "staging";

const requireInProtectedDeployments = (variableName: string) =>
  z
    .string()
    .optional()
    .superRefine((value, ctx) => {
      if (isProtectedDeployment && !value) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `${variableName} is required for staging and production deployments.`,
        });
      }
    });

const requireCloudinaryWhenEnabled = (variableName: string) =>
  z
    .string()
    .optional()
    .superRefine((value, ctx) => {
      const cloudinaryEnabled =
        process.env.NEXT_PUBLIC_CLOUDINARY_ENABLED === "true";
      if (isProtectedDeployment && cloudinaryEnabled && !value) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `${variableName} is required when Cloudinary is enabled in staging or production.`,
        });
      }
    });

const resendApiKeySchema = requireInProtectedDeployments(
  "RESEND_API_KEY",
).refine(
  (value) => !value || value.startsWith("re_"),
  "RESEND_API_KEY must start with re_",
);

const resendWebhookSecretSchema = requireInProtectedDeployments(
  "RESEND_WEBHOOK_SECRET",
).refine(
  (value) => !value || value.startsWith("whsec_"),
  "RESEND_WEBHOOK_SECRET must start with whsec_",
);

const resendEncryptionKeySchema = requireInProtectedDeployments(
  "RESEND_ENCRYPTION_KEY",
).refine(
  (value) => !value || value.length >= 32,
  "RESEND_ENCRYPTION_KEY must be at least 32 characters",
);

export const env = createEnv({
  server: {
    NODE_ENV: nodeEnvSchema,
    VERCEL_ENV: vercelEnvSchema,
    VERCEL_TARGET_ENV: z.string().optional(),
    VERCEL_URL: z.string().optional(),
    VERCEL_GIT_COMMIT_SHA: z.string().optional(),
    SUPABASE_SERVICE_ROLE_KEY: requireInProtectedDeployments(
      "SUPABASE_SERVICE_ROLE_KEY",
    ),
    SUPABASE_DB_URL: z.string().url().optional(),
    DEMO_ADMIN_EMAIL: z.string().email().optional(),
    DEMO_MISSIONARY_EMAIL: z.string().email().optional(),
    DEMO_DONOR_EMAIL: z.string().email().optional(),
    DEMO_DELIVERY_EMAIL: z.string().email().optional(),
    DEMO_TICKETING_EMAIL: z.string().email().optional(),
    DEMO_MACHINERY_EMAIL: z.string().email().optional(),
    DEMO_PASSWORD: z.string().optional(),
    DEMO_ONLY_LOGIN: optionalBoolean,
    CRON_SECRET: z.string().optional(),
    STRIPE_SECRET_KEY: requireInProtectedDeployments(
      "STRIPE_SECRET_KEY",
    ).refine(
      (value) => !value || value.startsWith("sk_"),
      "STRIPE_SECRET_KEY must start with sk_",
    ),
    STRIPE_WEBHOOK_SECRET: requireInProtectedDeployments(
      "STRIPE_WEBHOOK_SECRET",
    ).refine(
      (value) => !value || value.startsWith("whsec_"),
      "STRIPE_WEBHOOK_SECRET must start with whsec_",
    ),
    DOCRAPTOR_API_KEY: z.string().optional(),
    PDF_STUDIO_NATIVE_BUILDER_ENABLED: optionalBoolean,
    PDF_STUDIO_NATIVE_BUILDER_ROLLOUT: pdfStudioNativeBuilderRolloutSchema,
    PDF_STUDIO_NATIVE_BUILDER_TENANTS: z.string().optional(),
    PDF_STUDIO_NATIVE_BUILDER_CATEGORIES: z.string().optional(),
    PDF_STUDIO_LEGACY_UNLAYER_FALLBACK_ENABLED: optionalBooleanDefaultTrue,
    PDF_STUDIO_DOCRAPTOR_MODE: z
      .enum(["test", "production"])
      .optional()
      .default("test"),
    PDF_STUDIO_DOCRAPTOR_TIMEOUT_MS: z.coerce
      .number()
      .int()
      .positive()
      .optional(),
    PDF_STUDIO_RENDER_BASE_URL: z.string().url().optional(),
    PDF_STUDIO_RENDER_ASSET_URL_TTL_SECONDS: z.coerce
      .number()
      .int()
      .positive()
      .optional(),
    PDF_STUDIO_NATIVE_RENDER_CALLBACK_SECRET: z.string().min(1).optional(),
    PDF_STUDIO_NATIVE_RENDER_CALLBACK_URL: z.string().url().optional(),
    RESEND_API_KEY: resendApiKeySchema,
    RESEND_WEBHOOK_SECRET: resendWebhookSecretSchema,
    RESEND_ENCRYPTION_KEY: resendEncryptionKeySchema,
    SENTRY_DSN: z
      .string()
      .url()
      .optional()
      .superRefine((value, ctx) => {
        if (isProtectedDeployment && !value) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message:
              "SENTRY_DSN is required for staging and production deployments.",
          });
        }
      }),
    CLOUDINARY_API_SECRET: requireCloudinaryWhenEnabled(
      "CLOUDINARY_API_SECRET",
    ),
    ALLOW_DEMO_ACCOUNTS: optionalBoolean,
    E2E_AUTH_BYPASS: optionalBoolean,
    PLAYWRIGHT_BASE_URL: z.string().url().optional(),
    PLAYWRIGHT_PORT: z.string().optional(),
    VERIFY_E2E_PROJECTS: z.string().optional(),
    GOOGLE_SITE_VERIFICATION: z.string().optional(),
    BING_SITE_VERIFICATION: z.string().optional(),
    PAYLOAD_SECRET: z.string().optional(),
    PAYLOAD_DATABASE_URI: z.string().optional(),
    /** Server-only donor origin for CMS preview links (fallback after `NEXT_PUBLIC_DONOR_URL`). */
    DONOR_APP_URL: z.string().url().optional(),
    CMS_BASE_URL: z.string().url().optional(),
    TWENTY_API_URL: z.string().url().optional(),
    TWENTY_API_KEY: z.string().min(1).optional(),
    TWENTY_WEBHOOK_SECRET: z.string().min(1).optional(),
    TWENTY_WORKSPACE_ID: z.string().min(1).optional(),
    TWENTY_RATE_LIMIT_RPM: z.coerce.number().int().positive().optional(),
    CRM_SYNC_INBOUND_ENABLED: optionalBoolean,
    CRM_SYNC_OUTBOUND_ENABLED: optionalBoolean,
    CRM_SYNC_REPLAY_ENABLED: optionalBoolean,
    CRM_SYNC_RECONCILIATION_ENABLED: optionalBoolean,
    CRM_SYNC_WEBHOOK_TOLERANCE_SECONDS: z.coerce
      .number()
      .int()
      .positive()
      .optional(),
    APP_VERSION: z.string().optional(),
    GIT_REF: z.string().optional(),
    GIT_SHA: z.string().optional(),
    GITHUB_SHA: z.string().optional(),
    RENDER_GIT_COMMIT: z.string().optional(),
    FLY_IMAGE_REF: z.string().optional(),
    BUILD_DATE: z.string().optional(),
    SOURCE_DATE_EPOCH: z.string().optional(),
    PAYOUTS_ENABLED: optionalBoolean,
    PAYOUTS_MANUAL_PROVIDER_ENABLED: optionalBoolean,
    PAYOUTS_WISE_ENABLED: optionalBoolean,
    PAYOUTS_AIRWALLEX_ENABLED: optionalBoolean,
    PAYOUTS_CURRENCYCLOUD_ENABLED: optionalBoolean,
    PAYOUTS_CORPAY_ENABLED: optionalBoolean,
    PAYOUTS_STRIPE_GLOBAL_PAYOUTS_ENABLED: optionalBoolean,
    PAYOUTS_EXECUTION_ENABLED: optionalBoolean,
    PAYOUTS_SANDBOX_ONLY: optionalBoolean,
  },
  client: {
    NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
    NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1).optional(),
    NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: z.string().min(1).optional(),
    NEXT_PUBLIC_SITE_URL: z.string().url().optional(),
    NEXT_PUBLIC_APP_URL: z.string().url().optional(),
    NEXT_PUBLIC_MAIN_DOMAIN: z.string().optional(),
    NEXT_PUBLIC_APP_VERSION: z.string().optional(),
    NEXT_PUBLIC_GIT_REF: z.string().optional(),
    NEXT_PUBLIC_GIT_SHA: z.string().optional(),
    NEXT_PUBLIC_BUILD_DATE: z.string().optional(),
    NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: z.string().startsWith("pk_").optional(),
    NEXT_PUBLIC_EMAIL_STUDIO_BUILDER: z
      .enum(["react_email", "unlayer", "auto"])
      .optional()
      .default("react_email"),
    NEXT_PUBLIC_EMAIL_STUDIO_LEGACY_UNLAYER_ENABLED: optionalBoolean,
    NEXT_PUBLIC_UNLAYER_PROJECT_ID: z.string().optional(),
    NEXT_PUBLIC_UNLAYER_WHITE_LABEL: optionalBoolean,
    NEXT_PUBLIC_UNLAYER_ALLOWED_DOMAINS: z.string().optional(),
    NEXT_PUBLIC_BRAND_NAME: z.string().optional().default("GiveHope"),
    NEXT_PUBLIC_BRAND_LOGO_URL: z.string().optional(),
    NEXT_PUBLIC_BRAND_PRIMARY_COLOR: z.string().optional().default("#0f172a"),
    NEXT_PUBLIC_BRAND_ACCENT_COLOR: z.string().optional().default("#2563eb"),
    NEXT_PUBLIC_EMAIL_FOOTER_TEXT: z.string().optional(),
    NEXT_PUBLIC_PDF_FOOTER_TEXT: z.string().optional(),
    NEXT_PUBLIC_PDF_STUDIO_NATIVE_BUILDER_ENABLED: optionalBoolean,
    NEXT_PUBLIC_CLOUDINARY_ENABLED: optionalBoolean,
    NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME: requireCloudinaryWhenEnabled(
      "NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME",
    ),
    NEXT_PUBLIC_CLOUDINARY_API_KEY: requireCloudinaryWhenEnabled(
      "NEXT_PUBLIC_CLOUDINARY_API_KEY",
    ),
    NEXT_PUBLIC_SENTRY_DSN: z.string().url().optional(),
    /** Opt-in experimental React View Transitions (see `experimental.viewTransition` in Next config). */
    NEXT_PUBLIC_VIEW_TRANSITIONS_ENABLED: optionalBoolean,
    /** Donor app origin for CMS page preview links from admin Web Studio (default dev: http://127.0.0.1:3000). */
    NEXT_PUBLIC_DONOR_URL: z.string().url().optional(),
  },
  runtimeEnv: {
    NODE_ENV: process.env.NODE_ENV,
    VERCEL_ENV: process.env.VERCEL_ENV,
    VERCEL_TARGET_ENV: process.env.VERCEL_TARGET_ENV,
    VERCEL_URL: process.env.VERCEL_URL,
    VERCEL_GIT_COMMIT_SHA: process.env.VERCEL_GIT_COMMIT_SHA,
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY:
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
    SUPABASE_DB_URL: process.env.SUPABASE_DB_URL,
    DEMO_ADMIN_EMAIL: process.env.DEMO_ADMIN_EMAIL,
    DEMO_MISSIONARY_EMAIL: process.env.DEMO_MISSIONARY_EMAIL,
    DEMO_DONOR_EMAIL: process.env.DEMO_DONOR_EMAIL,
    DEMO_DELIVERY_EMAIL: process.env.DEMO_DELIVERY_EMAIL,
    DEMO_TICKETING_EMAIL: process.env.DEMO_TICKETING_EMAIL,
    DEMO_MACHINERY_EMAIL: process.env.DEMO_MACHINERY_EMAIL,
    DEMO_PASSWORD: process.env.DEMO_PASSWORD,
    DEMO_ONLY_LOGIN: process.env.DEMO_ONLY_LOGIN,
    CRON_SECRET: process.env.CRON_SECRET,
    STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
    STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET,
    DOCRAPTOR_API_KEY: process.env.DOCRAPTOR_API_KEY,
    PDF_STUDIO_NATIVE_BUILDER_ENABLED:
      process.env.PDF_STUDIO_NATIVE_BUILDER_ENABLED,
    PDF_STUDIO_NATIVE_BUILDER_ROLLOUT:
      process.env.PDF_STUDIO_NATIVE_BUILDER_ROLLOUT,
    PDF_STUDIO_NATIVE_BUILDER_TENANTS:
      process.env.PDF_STUDIO_NATIVE_BUILDER_TENANTS,
    PDF_STUDIO_NATIVE_BUILDER_CATEGORIES:
      process.env.PDF_STUDIO_NATIVE_BUILDER_CATEGORIES,
    PDF_STUDIO_LEGACY_UNLAYER_FALLBACK_ENABLED:
      process.env.PDF_STUDIO_LEGACY_UNLAYER_FALLBACK_ENABLED,
    PDF_STUDIO_DOCRAPTOR_MODE: process.env.PDF_STUDIO_DOCRAPTOR_MODE,
    PDF_STUDIO_DOCRAPTOR_TIMEOUT_MS:
      process.env.PDF_STUDIO_DOCRAPTOR_TIMEOUT_MS,
    PDF_STUDIO_RENDER_BASE_URL: process.env.PDF_STUDIO_RENDER_BASE_URL,
    PDF_STUDIO_RENDER_ASSET_URL_TTL_SECONDS:
      process.env.PDF_STUDIO_RENDER_ASSET_URL_TTL_SECONDS,
    PDF_STUDIO_NATIVE_RENDER_CALLBACK_SECRET:
      process.env.PDF_STUDIO_NATIVE_RENDER_CALLBACK_SECRET,
    PDF_STUDIO_NATIVE_RENDER_CALLBACK_URL:
      process.env.PDF_STUDIO_NATIVE_RENDER_CALLBACK_URL,
    RESEND_API_KEY: process.env.RESEND_API_KEY,
    RESEND_WEBHOOK_SECRET: process.env.RESEND_WEBHOOK_SECRET,
    RESEND_ENCRYPTION_KEY: process.env.RESEND_ENCRYPTION_KEY,
    SENTRY_DSN: process.env.SENTRY_DSN,
    CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET,
    ALLOW_DEMO_ACCOUNTS: process.env.ALLOW_DEMO_ACCOUNTS,
    E2E_AUTH_BYPASS: process.env.E2E_AUTH_BYPASS,
    PLAYWRIGHT_BASE_URL: process.env.PLAYWRIGHT_BASE_URL,
    PLAYWRIGHT_PORT: process.env.PLAYWRIGHT_PORT,
    VERIFY_E2E_PROJECTS: process.env.VERIFY_E2E_PROJECTS,
    GOOGLE_SITE_VERIFICATION: process.env.GOOGLE_SITE_VERIFICATION,
    BING_SITE_VERIFICATION: process.env.BING_SITE_VERIFICATION,
    PAYLOAD_SECRET: process.env.PAYLOAD_SECRET,
    PAYLOAD_DATABASE_URI: process.env.PAYLOAD_DATABASE_URI,
    DONOR_APP_URL: process.env.DONOR_APP_URL,
    CMS_BASE_URL: process.env.CMS_BASE_URL,
    TWENTY_API_URL: process.env.TWENTY_API_URL,
    TWENTY_API_KEY: process.env.TWENTY_API_KEY,
    TWENTY_WEBHOOK_SECRET: process.env.TWENTY_WEBHOOK_SECRET,
    TWENTY_WORKSPACE_ID: process.env.TWENTY_WORKSPACE_ID,
    TWENTY_RATE_LIMIT_RPM: process.env.TWENTY_RATE_LIMIT_RPM,
    CRM_SYNC_INBOUND_ENABLED: process.env.CRM_SYNC_INBOUND_ENABLED,
    CRM_SYNC_OUTBOUND_ENABLED: process.env.CRM_SYNC_OUTBOUND_ENABLED,
    CRM_SYNC_REPLAY_ENABLED: process.env.CRM_SYNC_REPLAY_ENABLED,
    CRM_SYNC_RECONCILIATION_ENABLED:
      process.env.CRM_SYNC_RECONCILIATION_ENABLED,
    CRM_SYNC_WEBHOOK_TOLERANCE_SECONDS:
      process.env.CRM_SYNC_WEBHOOK_TOLERANCE_SECONDS,
    APP_VERSION: process.env.APP_VERSION,
    GIT_REF: process.env.GIT_REF,
    GIT_SHA: process.env.GIT_SHA,
    GITHUB_SHA: process.env.GITHUB_SHA,
    RENDER_GIT_COMMIT: process.env.RENDER_GIT_COMMIT,
    FLY_IMAGE_REF: process.env.FLY_IMAGE_REF,
    BUILD_DATE: process.env.BUILD_DATE,
    SOURCE_DATE_EPOCH: process.env.SOURCE_DATE_EPOCH,
    PAYOUTS_ENABLED: process.env.PAYOUTS_ENABLED,
    PAYOUTS_MANUAL_PROVIDER_ENABLED:
      process.env.PAYOUTS_MANUAL_PROVIDER_ENABLED,
    PAYOUTS_WISE_ENABLED: process.env.PAYOUTS_WISE_ENABLED,
    PAYOUTS_AIRWALLEX_ENABLED: process.env.PAYOUTS_AIRWALLEX_ENABLED,
    PAYOUTS_CURRENCYCLOUD_ENABLED: process.env.PAYOUTS_CURRENCYCLOUD_ENABLED,
    PAYOUTS_CORPAY_ENABLED: process.env.PAYOUTS_CORPAY_ENABLED,
    PAYOUTS_STRIPE_GLOBAL_PAYOUTS_ENABLED:
      process.env.PAYOUTS_STRIPE_GLOBAL_PAYOUTS_ENABLED,
    PAYOUTS_EXECUTION_ENABLED: process.env.PAYOUTS_EXECUTION_ENABLED,
    PAYOUTS_SANDBOX_ONLY: process.env.PAYOUTS_SANDBOX_ONLY,
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
    NEXT_PUBLIC_MAIN_DOMAIN: process.env.NEXT_PUBLIC_MAIN_DOMAIN,
    NEXT_PUBLIC_APP_VERSION: process.env.NEXT_PUBLIC_APP_VERSION,
    NEXT_PUBLIC_GIT_REF: process.env.NEXT_PUBLIC_GIT_REF,
    NEXT_PUBLIC_GIT_SHA: process.env.NEXT_PUBLIC_GIT_SHA,
    NEXT_PUBLIC_BUILD_DATE: process.env.NEXT_PUBLIC_BUILD_DATE,
    NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY:
      process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
    NEXT_PUBLIC_EMAIL_STUDIO_BUILDER:
      process.env.NEXT_PUBLIC_EMAIL_STUDIO_BUILDER,
    NEXT_PUBLIC_EMAIL_STUDIO_LEGACY_UNLAYER_ENABLED:
      process.env.NEXT_PUBLIC_EMAIL_STUDIO_LEGACY_UNLAYER_ENABLED,
    NEXT_PUBLIC_UNLAYER_PROJECT_ID: process.env.NEXT_PUBLIC_UNLAYER_PROJECT_ID,
    NEXT_PUBLIC_UNLAYER_WHITE_LABEL:
      process.env.NEXT_PUBLIC_UNLAYER_WHITE_LABEL,
    NEXT_PUBLIC_UNLAYER_ALLOWED_DOMAINS:
      process.env.NEXT_PUBLIC_UNLAYER_ALLOWED_DOMAINS,
    NEXT_PUBLIC_BRAND_NAME: process.env.NEXT_PUBLIC_BRAND_NAME,
    NEXT_PUBLIC_BRAND_LOGO_URL: process.env.NEXT_PUBLIC_BRAND_LOGO_URL,
    NEXT_PUBLIC_BRAND_PRIMARY_COLOR:
      process.env.NEXT_PUBLIC_BRAND_PRIMARY_COLOR,
    NEXT_PUBLIC_BRAND_ACCENT_COLOR: process.env.NEXT_PUBLIC_BRAND_ACCENT_COLOR,
    NEXT_PUBLIC_EMAIL_FOOTER_TEXT: process.env.NEXT_PUBLIC_EMAIL_FOOTER_TEXT,
    NEXT_PUBLIC_PDF_FOOTER_TEXT: process.env.NEXT_PUBLIC_PDF_FOOTER_TEXT,
    NEXT_PUBLIC_PDF_STUDIO_NATIVE_BUILDER_ENABLED:
      process.env.NEXT_PUBLIC_PDF_STUDIO_NATIVE_BUILDER_ENABLED,
    NEXT_PUBLIC_CLOUDINARY_ENABLED: process.env.NEXT_PUBLIC_CLOUDINARY_ENABLED,
    NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME:
      process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
    NEXT_PUBLIC_CLOUDINARY_API_KEY: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY,
    NEXT_PUBLIC_SENTRY_DSN: process.env.NEXT_PUBLIC_SENTRY_DSN,
    NEXT_PUBLIC_VIEW_TRANSITIONS_ENABLED:
      process.env.NEXT_PUBLIC_VIEW_TRANSITIONS_ENABLED,
    NEXT_PUBLIC_DONOR_URL: process.env.NEXT_PUBLIC_DONOR_URL,
  },
  skipValidation:
    process.env.SKIP_ENV_VALIDATION === "1" ||
    process.env.SKIP_ENV_VALIDATION === "true",
  emptyStringAsUndefined: true,
});

if (
  !process.env.SKIP_ENV_VALIDATION &&
  !env.NEXT_PUBLIC_SUPABASE_ANON_KEY &&
  !env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
) {
  throw new Error(
    "Missing Supabase public key. Set NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY or NEXT_PUBLIC_SUPABASE_ANON_KEY.",
  );
}

type ClientEnvKey = Extract<keyof typeof env, `NEXT_PUBLIC_${string}`>;

export const clientEnv: Pick<typeof env, ClientEnvKey> = env;
export const serverEnv = env;

export const runtimeEnvFlags = {
  NODE_ENV: runtimeContext.nodeEnv,
  VERCEL_ENV: runtimeContext.vercelEnv,
  VERCEL_TARGET_ENV: runtimeContext.vercelTargetEnv,
  IS_PROTECTED_DEPLOYMENT: isProtectedDeployment,
} as const;
