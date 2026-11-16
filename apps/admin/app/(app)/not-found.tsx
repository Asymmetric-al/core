import { ButtonLink } from "@asym/ui/components/shadcn/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@asym/ui/components/shadcn/empty";
import Link from "next/link";

export default function RouteNotFound() {
  return (
    <Empty>
      <EmptyHeader>
        <EmptyTitle>
          <h1>Page not found</h1>
        </EmptyTitle>
        <EmptyDescription>
          This page may have moved. Use the sidebar or return to Home to find
          what you need.
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <ButtonLink render={<Link href="/" />}>Back to Home</ButtonLink>
      </EmptyContent>
    </Empty>
  );
}
