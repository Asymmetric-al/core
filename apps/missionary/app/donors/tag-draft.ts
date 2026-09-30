export type DonorTagDraft = {
  donorId: string | null;
  tags: string[];
};

export const EMPTY_TAG_DRAFT: DonorTagDraft = {
  donorId: null,
  tags: [],
};

export function nextTagDraftOnDonorSelect(
  previous: DonorTagDraft,
  selectedId: string,
): DonorTagDraft {
  return previous.donorId === selectedId ? previous : EMPTY_TAG_DRAFT;
}
