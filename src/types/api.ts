/**
 * API Types
 *
 * Standardized types for API request/response handling.
 * Use these types in API routes and client-side data fetching.
 */

/**
 * Standard API error response
 */
export interface ApiError {
  error: string;
  message?: string;
  code?: string;
  details?: Record<string, unknown>;
}

/**
 * Standard API success response wrapper
 */
export interface ApiResponse<T> {
  data: T;
  meta?: ApiMeta;
}

/**
 * Pagination metadata
 */
export interface ApiMeta {
  page?: number;
  limit?: number;
  total?: number;
  totalPages?: number;
  hasMore?: boolean;
}

/**
 * Paginated response wrapper
 */
export interface PaginatedResponse<T> {
  data: T[];
  meta: Required<
    Pick<ApiMeta, "page" | "limit" | "total" | "totalPages" | "hasMore">
  >;
}

/**
 * Standard pagination query parameters
 */
export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

/**
 * Standard filter parameters
 */
export interface FilterParams {
  search?: string;
  startDate?: string;
  endDate?: string;
  status?: string;
  [key: string]: string | number | boolean | undefined;
}

/**
 * Combined query parameters for list endpoints
 */
export interface ListQueryParams extends PaginationParams, FilterParams {}

/**
 * Mutation response with affected item
 */
export interface MutationResponse<T> {
  data: T;
  message?: string;
}

/**
 * Delete response
 */
export interface DeleteResponse {
  success: boolean;
  message?: string;
}

/**
 * Batch operation response
 */
export interface BatchResponse<T> {
  successful: T[];
  failed: Array<{
    item: T;
    error: string;
  }>;
  totalProcessed: number;
  successCount: number;
  failureCount: number;
}

/**
 * Authentication response
 */
export interface AuthResponse {
  user: {
    id: string;
    email: string;
    name?: string;
    role?: string;
  };
  session?: {
    accessToken: string;
    refreshToken?: string;
    expiresAt: number;
  };
}

/**
 * Upload response
 */
export interface UploadResponse {
  url: string;
  path: string;
  size: number;
  mimeType: string;
}

/**
 * Webhook payload base
 */
export interface WebhookPayload<T = unknown> {
  event: string;
  timestamp: string;
  data: T;
}

/**
 * Type guard to check if response is an error
 */
export function isApiError(response: unknown): response is ApiError {
  return (
    typeof response === "object" &&
    response !== null &&
    "error" in response &&
    typeof (response as ApiError).error === "string"
  );
}

/**
 * Helper type for extracting data type from ApiResponse
 */
export type ExtractApiData<T> = T extends ApiResponse<infer U> ? U : never;

/**
 * Helper type for making all properties optional recursively
 */
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};
