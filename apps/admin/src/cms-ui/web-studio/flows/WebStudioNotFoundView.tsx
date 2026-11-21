"use client";

import { buttonVariants } from "@asym/ui/components/shadcn/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@asym/ui/components/shadcn/empty";
import { NotFoundClient, useAuth } from "@payloadcms/ui";
import { FileQuestion } from "lucide-react";

import { Link } from "../routing";
import { MissionControlLink } from "../shell/mission-control-link";
import { StudioLayout } from "../shell/studio-layout";

export function WebStudioNotFoundView() {
  // The enclosing Payload layout owns staff authentication and access results.
  const { user, permissions } = useAuth();
  if (!user || !permissions?.canAccessAdmin) return <NotFoundClient />;

  return (
    <StudioLayout currentLabel="Page not found">
      <Empty className="py-16">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <FileQuestion aria-hidden="true" />
          </EmptyMedia>
          <EmptyTitle>
            <h1>This page isn’t here</h1>
          </EmptyTitle>
          <EmptyDescription>
            It may have been deleted or moved, or the link may be wrong.
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <div className="flex flex-wrap justify-center gap-2">
            <Link href="/web-studio" className={buttonVariants()}>
              Back to Web Studio
            </Link>
            <MissionControlLink
              className={buttonVariants({ variant: "outline" })}
            >
              Back to Mission Control
            </MissionControlLink>
          </div>
        </EmptyContent>
      </Empty>
    </StudioLayout>
  );
}
