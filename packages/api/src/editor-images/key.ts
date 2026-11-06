import { extensionForImageType, type ProfileImageType } from "../upload/image";

/** What an editor image belongs to; the editor mount sends it (#2407 OQ19). */
export const EDITOR_IMAGE_PURPOSES = [
  "feed",
  "care-thread",
  "care-note",
] as const;
export type EditorImagePurpose = (typeof EDITOR_IMAGE_PURPOSES)[number];

export function isEditorImagePurpose(
  value: unknown,
): value is EditorImagePurpose {
  return (EDITOR_IMAGE_PURPOSES as readonly unknown[]).includes(value);
}

/**
 * Key in the editor image bucket, from the caller's auth context only:
 * editor/{tenantId}/{userId}/{uuid}.{ext}, matching the bucket's owner-folder
 * INSERT policy (20261028100000_editor_image_storage.sql).
 */
export function editorImagePath(input: {
  tenantId: string;
  userId: string;
  type: ProfileImageType;
}): string {
  return `editor/${input.tenantId}/${input.userId}/${crypto.randomUUID()}.${extensionForImageType(input.type)}`;
}
