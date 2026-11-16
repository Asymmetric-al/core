"use client";

import { Button } from "@asym/ui/components/shadcn/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@asym/ui/components/shadcn/tooltip";
import { toast, useConfig } from "@payloadcms/ui";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Pin } from "lucide-react";

import {
  DASHBOARD_DOCUMENTS_QUERY_KEY,
  PINNED_DOCUMENTS_QUERY_KEY,
  pinnedDocumentKey,
  pinnedDocumentsURL,
  readPinnedDocuments,
  updatePinnedDocument,
} from "../../../preferences/pinned-documents";

/**
 * Pins the open document to the user's Studio home. Writes Payload's own
 * `pinned-documents` preference (the record its stock dashboard widget
 * reads), so pins stay one list wherever they are made or removed.
 */
export function DocumentPinToggle({
  collectionSlug,
  documentId,
}: {
  collectionSlug: string;
  /** Payload's id as stored (a number for serial ids), not a URL string. */
  documentId: string | number;
}) {
  const queryClient = useQueryClient();
  const {
    config: { routes, serverURL },
  } = useConfig();
  const url = pinnedDocumentsURL({ apiRoute: routes.api, serverURL });
  const pins = useQuery({
    queryKey: [...PINNED_DOCUMENTS_QUERY_KEY, url],
    queryFn: () => readPinnedDocuments(url),
  });
  const document = { id: documentId, collectionSlug };
  const key = pinnedDocumentKey(document);
  const pinned =
    pins.data?.some((pin) => pinnedDocumentKey(pin) === key) ?? false;
  const toggle = useMutation({
    mutationFn: (shouldPin: boolean) =>
      updatePinnedDocument({ document, shouldPin, url }),
    onError: () => {
      toast.error("Pins couldn't be updated. Try again.");
    },
    onSettled: () =>
      Promise.all([
        queryClient.invalidateQueries({ queryKey: PINNED_DOCUMENTS_QUERY_KEY }),
        queryClient.invalidateQueries({
          queryKey: DASHBOARD_DOCUMENTS_QUERY_KEY,
        }),
      ]),
  });
  const hint = pins.isError
    ? "Pins are unavailable right now"
    : pinned
      ? "Pinned to your Studio home"
      : "Pin to your Studio home";

  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <Button
            type="button"
            variant={pinned ? "secondary" : "outline"}
            size="sm"
            aria-label="Pin to Studio home"
            aria-pressed={pinned}
            disabled={pins.isPending || pins.isError || toggle.isPending}
            onClick={() => toggle.mutate(!pinned)}
          >
            <Pin aria-hidden="true" />
            {/* A toggle keeps one name; pressed state shows as the filled
                variant and `aria-pressed`. Phones show the icon only. */}
            <span className="hidden md:inline">Pin</span>
          </Button>
        }
      />
      <TooltipContent>{hint}</TooltipContent>
    </Tooltip>
  );
}
