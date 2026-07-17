/**
 * Browser-safe HTTP error type.
 *
 * Kept free of `next/server` (and any other server-only import) so modules
 * that only need to throw typed HTTP errors — capability predicates, policy
 * helpers, preference resolution — can be pulled into client component
 * bundles without dragging server runtime modules along. Response
 * normalization stays in `./http-errors`, which re-exports this class for
 * server-side consumers.
 */
export class ApiHttpError extends Error {
  constructor(
    readonly status: number,
    message: string,
  ) {
    super(message);
    this.name = "ApiHttpError";
  }
}
