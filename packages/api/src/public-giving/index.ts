/**
 * Public giving-flow READ layer — MVP Item 3a.
 *
 * PII-safe projection + column allowlists for the anonymous donor-facing
 * giving flow (/workers directory + /workers/[id] profile + updates feed).
 * See `./types` for the data-boundary contract.
 */
export type {
  Dollars,
  PublicWorker,
  PublicWorkerUpdate,
  RawMissionaryForPublic,
  RawPostForPublic,
  RawProfileForPublic,
} from "./types";

export {
  computePercentRaised,
  publicWorkerTitle,
  toPublicWorker,
  toPublicWorkerUpdate,
} from "./projection";

export {
  FORBIDDEN_PUBLIC_COLUMNS,
  PUBLIC_POST_SELECT,
  PUBLIC_WORKER_SELECT,
  assertNoForbiddenPublicColumns,
} from "./columns";
