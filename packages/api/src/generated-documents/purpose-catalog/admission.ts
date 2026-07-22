import { resolvePurposeAvailability } from "./availability";
import { getDocumentPurposeContract } from "./lookup";
import { getDocumentPurposeCatalogDigest } from "./serialization";

import type { ResolvePurposeAvailabilityInput } from "./availability";
import type {
  DocumentPurposeId,
  DocumentPurposeLane,
  DocumentQualificationAvailabilityPort,
  PurposeAvailabilityCause,
  PurposeAvailabilityState,
} from "./types";

/**
 * Narrow public admission adapter: the fail-closed front door a future
 * Generated Document service will stand behind. It admits a purpose only when
 * availability resolves to `supported`, and it allocates nothing — no
 * document, artifact, reference, or serial identity exists at this seam.
 */

export type DocumentPurposeAdmissionResult =
  | {
      admitted: true;
      purpose_id: DocumentPurposeId;
      lane: DocumentPurposeLane;
      /** Pin for later Generation Requests: the exact catalog digest admitted against. */
      catalog_digest: string;
      admitted_at: string;
    }
  | {
      admitted: false;
      purpose_id: string;
      state: Exclude<PurposeAvailabilityState, "supported">;
      causes: readonly PurposeAvailabilityCause[];
    };

export async function admitDocumentPurpose(
  input: ResolvePurposeAvailabilityInput,
  deps: {
    qualificationPort: DocumentQualificationAvailabilityPort;
    now?: () => Date;
  },
): Promise<DocumentPurposeAdmissionResult> {
  const now = deps.now ?? (() => new Date());
  const availability = await resolvePurposeAvailability(
    input,
    deps.qualificationPort,
  );

  if (availability.state !== "supported") {
    return {
      admitted: false,
      purpose_id: availability.purpose_id,
      state: availability.state,
      causes: availability.causes,
    };
  }

  const contract = getDocumentPurposeContract(availability.purpose_id);
  return {
    admitted: true,
    purpose_id: availability.purpose_id as DocumentPurposeId,
    lane: contract.lane,
    catalog_digest: getDocumentPurposeCatalogDigest(),
    admitted_at: now().toISOString(),
  };
}
