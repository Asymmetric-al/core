import { createContext } from "react";

import { resolveDocumentThumbnail } from "./payload-list-grid";

export const DocumentThumbnailSource = createContext<
  (doc: Record<string, unknown>) => string | null
>(resolveDocumentThumbnail);
