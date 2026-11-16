"use client";

import { ReferenceId } from "./reference-id";
import { documentReferenceOf, useReferenceLabels } from "./reference-labels";

const NO_ACCESSORS: readonly string[] = [];

/**
 * The record a document is for, by name ("for Grace Okafor"), as the lists
 * show it: the stored ID stays one copy away, and stands in (shortened)
 * when the viewer's list does not name it. Renders nothing for documents
 * without a reference.
 */
export function DocumentReference({
  data,
}: {
  data: Record<string, unknown> | null | undefined;
}) {
  const reference = documentReferenceOf(data);
  const labels = useReferenceLabels(
    reference ? [reference.accessor] : NO_ACCESSORS,
  );
  if (!reference) return null;
  const name = labels[reference.accessor]?.find(
    (option) => option.value === reference.id,
  )?.label;
  return (
    <span className="inline-flex min-w-0 items-center gap-1">
      <span>for</span>
      <ReferenceId value={reference.id} label={reference.idLabel} name={name} />
    </span>
  );
}
