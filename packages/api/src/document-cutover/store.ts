import { DOCUMENT_CUTOVER_PROOFS_DIR } from "./types";

import type {
  DocumentCutoverEnvironmentProof,
  DocumentCutoverProofStore,
} from "./types";

/**
 * File name of a committed proof: `<ISO>-<proofId>.json`. The ISO timestamp is
 * the proof's `recordedAt` with `:` replaced by `-` so the name is portable.
 */
export function documentCutoverProofFileName(
  recordedAt: string,
  proofId: string,
): string {
  return `${recordedAt.replaceAll(":", "-")}-${proofId}.json`;
}

/** Repo-relative path a proof is committed at, under `directory`. */
export function documentCutoverProofPath(
  recordedAt: string,
  proofId: string,
  directory: string = DOCUMENT_CUTOVER_PROOFS_DIR,
): string {
  const base = directory.replace(/\/+$/, "");
  return `${base}/${documentCutoverProofFileName(recordedAt, proofId)}`;
}

/**
 * Append-only in-memory proof sink. Used by tests and dry runs; operator runs
 * write the proof file that is then committed through a PR. Every read returns
 * a deep copy so callers can never mutate a stored proof.
 */
export class InMemoryDocumentCutoverProofStore implements DocumentCutoverProofStore {
  private readonly proofs = new Map<string, DocumentCutoverEnvironmentProof>();

  async append(proof: DocumentCutoverEnvironmentProof): Promise<void> {
    if (this.proofs.has(proof.proofId)) {
      throw new Error(
        `Proof ${proof.proofId} already exists; proofs are append-only and never edited.`,
      );
    }
    this.proofs.set(proof.proofId, structuredClone(proof));
  }

  async getById(
    proofId: string,
  ): Promise<DocumentCutoverEnvironmentProof | null> {
    const proof = this.proofs.get(proofId);
    return proof ? structuredClone(proof) : null;
  }

  async list(): Promise<DocumentCutoverEnvironmentProof[]> {
    return Array.from(this.proofs.values(), (proof) => structuredClone(proof));
  }
}
