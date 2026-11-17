/**
 * Legacy shared constants. Nothing in the workspace imports this module
 * (directly or through the `@asym/config` barrel), and some values disagree
 * with the live product: the task statuses and priorities differ from the
 * missionary task model, and site branding is owned by `site-shared.ts`.
 * Verify against the owning code before adopting any value here.
 */

export const APP = {
  name: "Give Hope",
  description: "Mission Resource Management Platform",
  tagline: "Effortless Impact",
} as const;

export const API = {
  defaultPageSize: 20,
  maxPageSize: 100,
  defaultTimeout: 30000,
  retryAttempts: 3,
} as const;

export const AUTH = {
  sessionDuration: 60 * 60 * 24 * 7, // 7 days in seconds
  refreshThreshold: 60 * 60, // 1 hour in seconds
  demoAccountPrefix: "demo_",
} as const;

export const DONATIONS = {
  minAmount: 1,
  maxAmount: 1000000,
  defaultCurrency: "USD",
  supportedCurrencies: ["USD", "EUR", "GBP", "CAD"] as const,
  frequencies: [
    "weekly",
    "biweekly",
    "monthly",
    "quarterly",
    "yearly",
  ] as const,
} as const;

export const UPLOADS = {
  maxFileSize: 10 * 1024 * 1024, // 10MB
  allowedImageTypes: [
    "image/jpeg",
    "image/png",
    "image/gif",
    "image/webp",
  ] as const,
  allowedDocTypes: ["application/pdf"] as const,
  maxImagesPerPost: 10,
} as const;

/**
 * Cache durations (in milliseconds)
 */
export const CACHE = {
  staleTime: 60 * 1000, // 1 minute
  gcTime: 5 * 60 * 1000, // 5 minutes
  revalidateOnFocus: false,
} as const;

export const DATE_FORMATS = {
  display: "MMM d, yyyy",
  displayWithTime: "MMM d, yyyy h:mm a",
  iso: "yyyy-MM-dd",
  month: "MMM yyyy",
  shortMonth: "MMM",
} as const;

export const CHARTS = {
  defaultBarRadius: [4, 4, 0, 0] as const,
  maxBarSize: 52,
  yAxisWidth: 40,
  tickMargin: 8,
  animationDuration: 300,
} as const;

export const PAGINATION = {
  defaultPage: 1,
  defaultLimit: 20,
  maxLimit: 100,
} as const;

export const FEED = {
  postsPerPage: 10,
  maxContentLength: 5000,
  previewLength: 280,
} as const;

export const TASK_PRIORITIES = ["low", "medium", "high", "urgent"] as const;
export type TaskPriority = (typeof TASK_PRIORITIES)[number];

export const TASK_STATUSES = [
  "pending",
  "in_progress",
  "completed",
  "cancelled",
] as const;
export type TaskStatus = (typeof TASK_STATUSES)[number];

export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
} as const;

export const ERROR_MESSAGES = {
  UNAUTHORIZED: "You must be logged in to perform this action",
  FORBIDDEN: "You do not have permission to perform this action",
  NOT_FOUND: "The requested resource was not found",
  VALIDATION_FAILED: "Please check your input and try again",
  SERVER_ERROR: "Something went wrong. Please try again later.",
  NETWORK_ERROR: "Unable to connect. Please check your internet connection.",
} as const;
