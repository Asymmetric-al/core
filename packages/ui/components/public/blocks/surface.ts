import type { ReactNode } from "react";

/**
 * What a block asks the page around it to draw. The registry owns each
 * block's content and layout; the surface owns the two things that differ
 * between Web Studio's private preview and the public site: how stored media
 * becomes an image, and whether a call to action is a working link.
 */
export interface PublicBlockSurface {
  /**
   * Draws a stored media value in a block's media slot, sized for that slot.
   * Returns null when the value does not resolve to an image, and the block
   * then leaves the slot out.
   */
  renderMedia(input: { media: unknown; slot: PublicBlockMediaSlot }): ReactNode;
  /** Draws a call to action. Only called when it has a label and a destination. */
  renderAction(input: PublicBlockAction): ReactNode;
}

/** `banner`: a full-width image above text. `feature`: an image beside text. */
export type PublicBlockMediaSlot = "banner" | "feature";

export interface PublicBlockAction {
  label: string;
  href: string;
  /** `primary` leads a block; `secondary` sits beside its copy. */
  emphasis: "primary" | "secondary";
  openInNewTab: boolean;
}
