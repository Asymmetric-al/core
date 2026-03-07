import { z } from "zod";

export const cmsPublicErrorCodeSchema = z.enum([
  "TENANT_NOT_FOUND",
  "PAGE_NOT_FOUND",
  "UPSTREAM_FAILURE",
  "INVALID_RESPONSE",
]);

export type CmsPublicErrorCode = z.infer<typeof cmsPublicErrorCodeSchema>;

export const cmsPublicErrorResponseSchema = z.object({
  error: z.object({
    code: cmsPublicErrorCodeSchema,
    message: z.string().min(1),
  }),
});

export const cmsTenantSummarySchema = z.object({
  id: z.string().min(1),
  slug: z.string().nullable(),
});

export const cmsPublicNavigationItemSchema = z.object({
  label: z.string().min(1),
  href: z.string().min(1),
  openInNewTab: z.boolean(),
});

export const cmsPublicNavigationSchema = z.object({
  id: z.string().min(1),
  label: z.string().min(1),
  items: z.array(cmsPublicNavigationItemSchema),
});

export const cmsPublicNavigationResponseSchema = z.object({
  navigation: cmsPublicNavigationSchema.nullable(),
  tenant: cmsTenantSummarySchema,
});

export const cmsPublicPageSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  slug: z.string().min(1),
  summary: z.string().nullable(),
  content: z.unknown(),
  updatedAt: z.string().nullable(),
});

export const cmsPublicPageResponseSchema = z.object({
  page: cmsPublicPageSchema,
  tenant: cmsTenantSummarySchema,
});

export const cmsPublicUpdateSchema = z.object({
  id: z.string().min(1),
  slug: z.string().min(1),
  title: z.string().min(1),
  excerpt: z.string().nullable(),
  publishedAt: z.string().nullable(),
});

export const cmsPublicUpdatesResponseSchema = z.object({
  tenant: cmsTenantSummarySchema,
  updates: z.array(cmsPublicUpdateSchema),
});

export type CmsPublicErrorResponse = z.infer<
  typeof cmsPublicErrorResponseSchema
>;
export type CmsTenantSummary = z.infer<typeof cmsTenantSummarySchema>;
export type CmsPublicNavigation = z.infer<typeof cmsPublicNavigationSchema>;
export type CmsPublicNavigationResponse = z.infer<
  typeof cmsPublicNavigationResponseSchema
>;
export type CmsPublicPage = z.infer<typeof cmsPublicPageSchema>;
export type CmsPublicPageResponse = z.infer<typeof cmsPublicPageResponseSchema>;
export type CmsPublicUpdate = z.infer<typeof cmsPublicUpdateSchema>;
export type CmsPublicUpdatesResponse = z.infer<
  typeof cmsPublicUpdatesResponseSchema
>;

export function parseCmsPublicErrorResponse(input: unknown) {
  return cmsPublicErrorResponseSchema.safeParse(input);
}

export function parseCmsPublicPageResponse(input: unknown) {
  return cmsPublicPageResponseSchema.safeParse(input);
}

export function parseCmsPublicUpdatesResponse(input: unknown) {
  return cmsPublicUpdatesResponseSchema.safeParse(input);
}
