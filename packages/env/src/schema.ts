import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

const optionalBoolean = z
  .enum(["true", "false"])
  .optional()
  .transform((value) => value === "true");

const nodeEnvSchema = z
  .enum(["development", "test", "production"])
  .optional()
  .default("development");

const vercelEnvSchema = z
  .enum(["production", "preview", "development"])
  .optional();

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
    DEMO_PASSWORD: z.string().optional(),
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
    PLAYWRIGHT_BASE_URL: z.string().url().optional(),
    PLAYWRIGHT_PORT: z.string().optional(),
    VERIFY_E2E_PROJECTS: z.string().optional(),
    GOOGLE_SITE_VERIFICATION: z.string().optional(),
    BING_SITE_VERIFICATION: z.string().optional(),
    APP_VERSION: z.string().optional(),
    GIT_REF: z.string().optional(),
    GIT_SHA: z.string().optional(),
    GITHUB_SHA: z.string().optional(),
    RENDER_GIT_COMMIT: z.string().optional(),
    FLY_IMAGE_REF: z.string().optional(),
    BUILD_DATE: z.string().optional(),
    SOURCE_DATE_EPOCH: z.string().optional(),
  },
  client: {
    NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
    NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
    NEXT_PUBLIC_SITE_URL: z.string().url().optional(),
    NEXT_PUBLIC_APP_URL: z.string().url().optional(),
    NEXT_PUBLIC_MAIN_DOMAIN: z.string().optional(),
    NEXT_PUBLIC_APP_VERSION: z.string().optional(),
    NEXT_PUBLIC_GIT_REF: z.string().optional(),
    NEXT_PUBLIC_GIT_SHA: z.string().optional(),
    NEXT_PUBLIC_BUILD_DATE: z.string().optional(),
    NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: z.string().startsWith("pk_").optional(),
    NEXT_PUBLIC_UNLAYER_PROJECT_ID: z.string().optional(),
    NEXT_PUBLIC_UNLAYER_WHITE_LABEL: optionalBoolean,
    NEXT_PUBLIC_UNLAYER_ALLOWED_DOMAINS: z.string().optional(),
    NEXT_PUBLIC_BRAND_NAME: z.string().optional().default("GiveHope"),
    NEXT_PUBLIC_BRAND_LOGO_URL: z.string().optional(),
    NEXT_PUBLIC_BRAND_PRIMARY_COLOR: z.string().optional().default("#0f172a"),
    NEXT_PUBLIC_BRAND_ACCENT_COLOR: z.string().optional().default("#2563eb"),
    NEXT_PUBLIC_EMAIL_FOOTER_TEXT: z.string().optional(),
    NEXT_PUBLIC_PDF_FOOTER_TEXT: z.string().optional(),
    NEXT_PUBLIC_CLOUDINARY_ENABLED: optionalBoolean,
    NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME: requireCloudinaryWhenEnabled(
      "NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME",
    ),
    NEXT_PUBLIC_CLOUDINARY_API_KEY: requireCloudinaryWhenEnabled(
      "NEXT_PUBLIC_CLOUDINARY_API_KEY",
    ),
    NEXT_PUBLIC_SENTRY_DSN: z.string().url().optional(),
  },
  runtimeEnv: {
    NODE_ENV: process.env.NODE_ENV,
    VERCEL_ENV: process.env.VERCEL_ENV,
    VERCEL_TARGET_ENV: process.env.VERCEL_TARGET_ENV,
    VERCEL_URL: process.env.VERCEL_URL,
    VERCEL_GIT_COMMIT_SHA: process.env.VERCEL_GIT_COMMIT_SHA,
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
    SUPABASE_DB_URL: process.env.SUPABASE_DB_URL,
    DEMO_ADMIN_EMAIL: process.env.DEMO_ADMIN_EMAIL,
    DEMO_MISSIONARY_EMAIL: process.env.DEMO_MISSIONARY_EMAIL,
    DEMO_DONOR_EMAIL: process.env.DEMO_DONOR_EMAIL,
    DEMO_PASSWORD: process.env.DEMO_PASSWORD,
    CRON_SECRET: process.env.CRON_SECRET,
    STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
    STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET,
    SENTRY_DSN: process.env.SENTRY_DSN,
    CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET,
    ALLOW_DEMO_ACCOUNTS: process.env.ALLOW_DEMO_ACCOUNTS,
    PLAYWRIGHT_BASE_URL: process.env.PLAYWRIGHT_BASE_URL,
    PLAYWRIGHT_PORT: process.env.PLAYWRIGHT_PORT,
    VERIFY_E2E_PROJECTS: process.env.VERIFY_E2E_PROJECTS,
    GOOGLE_SITE_VERIFICATION: process.env.GOOGLE_SITE_VERIFICATION,
    BING_SITE_VERIFICATION: process.env.BING_SITE_VERIFICATION,
    APP_VERSION: process.env.APP_VERSION,
    GIT_REF: process.env.GIT_REF,
    GIT_SHA: process.env.GIT_SHA,
    GITHUB_SHA: process.env.GITHUB_SHA,
    RENDER_GIT_COMMIT: process.env.RENDER_GIT_COMMIT,
    FLY_IMAGE_REF: process.env.FLY_IMAGE_REF,
    BUILD_DATE: process.env.BUILD_DATE,
    SOURCE_DATE_EPOCH: process.env.SOURCE_DATE_EPOCH,
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
    NEXT_PUBLIC_MAIN_DOMAIN: process.env.NEXT_PUBLIC_MAIN_DOMAIN,
    NEXT_PUBLIC_APP_VERSION: process.env.NEXT_PUBLIC_APP_VERSION,
    NEXT_PUBLIC_GIT_REF: process.env.NEXT_PUBLIC_GIT_REF,
    NEXT_PUBLIC_GIT_SHA: process.env.NEXT_PUBLIC_GIT_SHA,
    NEXT_PUBLIC_BUILD_DATE: process.env.NEXT_PUBLIC_BUILD_DATE,
    NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY:
      process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
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
    NEXT_PUBLIC_CLOUDINARY_ENABLED: process.env.NEXT_PUBLIC_CLOUDINARY_ENABLED,
    NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME:
      process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
    NEXT_PUBLIC_CLOUDINARY_API_KEY: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY,
    NEXT_PUBLIC_SENTRY_DSN: process.env.NEXT_PUBLIC_SENTRY_DSN,
  },
  skipValidation:
    process.env.SKIP_ENV_VALIDATION === "1" ||
    process.env.SKIP_ENV_VALIDATION === "true",
  emptyStringAsUndefined: true,
});

type ClientEnvKey = Extract<keyof typeof env, `NEXT_PUBLIC_${string}`>;

export const clientEnv: Pick<typeof env, ClientEnvKey> = env;
export const serverEnv = env;

export const runtimeEnvFlags = {
  NODE_ENV: runtimeContext.nodeEnv,
  VERCEL_ENV: runtimeContext.vercelEnv,
  VERCEL_TARGET_ENV: runtimeContext.vercelTargetEnv,
  IS_PROTECTED_DEPLOYMENT: isProtectedDeployment,
} as const;
