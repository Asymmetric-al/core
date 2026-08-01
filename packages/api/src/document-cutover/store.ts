import type {
  DocumentCutoverEnvironmentProof,
  DocumentCutoverProofStore,
} from "./types";

/**
 * Append-only in-memory proof store. Used by tests and dry runs; durable
 * operator runs plug in a file-backed implementation of the same seam. Every
 * read returns a deep copy so callers can never mutate a stored proof.
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
