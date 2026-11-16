"use client";

import { Button, buttonVariants } from "@asym/ui/components/shadcn/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@asym/ui/components/shadcn/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@asym/ui/components/shadcn/tooltip";
import { cn } from "@asym/ui/lib/utils";
import { ExternalLink, Eye } from "lucide-react";

type PreviewLinksProps = {
  /** Signed-in preview of the current draft, when the collection has one. */
  previewURL: string | null;
  /** The page on the organization's site, when a site origin is set up. */
  publishedURL: string | null;
};

/** The document header's preview links, from the md breakpoint up. */
export function DocumentPreviewLinks({
  className,
  previewURL,
  publishedURL,
}: PreviewLinksProps & { className?: string }) {
  if (!previewURL && !publishedURL) return null;
  return (
    <div
      className={cn("hidden flex-wrap items-center gap-2 md:flex", className)}
    >
      {previewURL ? (
        <a
          href={previewURL}
          target="_blank"
          rel="noreferrer"
          className={buttonVariants({ variant: "outline", size: "sm" })}
        >
          <ExternalLink aria-hidden="true" />
          Preview
          <span className="sr-only"> (opens in a new tab)</span>
        </a>
      ) : null}
      {publishedURL ? (
        <a
          href={publishedURL}
          target="_blank"
          rel="noreferrer"
          className={buttonVariants({ variant: "ghost", size: "sm" })}
        >
          <ExternalLink aria-hidden="true" />
          View live page
          <span className="sr-only"> (opens in a new tab)</span>
        </a>
      ) : null}
    </div>
  );
}

/**
 * The same links on a phone, behind one icon button. With a single link the
 * button opens it directly: a menu of one item is an extra tap.
 */
export function DocumentPreviewMenu({
  previewURL,
  publishedURL,
}: PreviewLinksProps) {
  if (!previewURL && !publishedURL) return null;

  if (!previewURL || !publishedURL) {
    const href = (previewURL ?? publishedURL)!;
    const label = previewURL ? "Open preview" : "Open published page";
    return (
      <div className="md:hidden">
        <Tooltip>
          <TooltipTrigger
            render={
              <a
                href={href}
                target="_blank"
                rel="noreferrer"
                aria-label={`${label} (opens in a new tab)`}
                className={buttonVariants({
                  variant: "outline",
                  size: "icon-sm",
                })}
              >
                <Eye aria-hidden="true" />
              </a>
            }
          />
          <TooltipContent>{label}</TooltipContent>
        </Tooltip>
      </div>
    );
  }

  return (
    <div className="md:hidden">
      <DropdownMenu>
        <Tooltip>
          <TooltipTrigger
            render={
              <DropdownMenuTrigger
                render={
                  <Button
                    type="button"
                    variant="outline"
                    size="icon-sm"
                    aria-label="Preview"
                  >
                    <Eye aria-hidden="true" />
                  </Button>
                }
              />
            }
          />
          <TooltipContent>Preview</TooltipContent>
        </Tooltip>
        <DropdownMenuContent align="end">
          <DropdownMenuGroup>
            <DropdownMenuItem
              render={<a href={previewURL} target="_blank" rel="noreferrer" />}
            >
              <ExternalLink aria-hidden="true" />
              Open preview
              <span className="sr-only"> (opens in a new tab)</span>
            </DropdownMenuItem>
            <DropdownMenuItem
              render={
                <a href={publishedURL} target="_blank" rel="noreferrer" />
              }
            >
              <ExternalLink aria-hidden="true" />
              Open published page
              <span className="sr-only"> (opens in a new tab)</span>
            </DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
