import { TenantLink as Link } from "@asym/auth/tenant-navigation";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@asym/ui/components/shadcn/breadcrumb";

export function SupportTicketBreadcrumbs({ current }: { current?: string }) {
  return (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink render={<Link href="/support" />}>
            Support Hub
          </BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        {current ? (
          <>
            <BreadcrumbItem>
              <BreadcrumbLink render={<Link href="/support/tickets" />}>
                Tickets
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{current}</BreadcrumbPage>
            </BreadcrumbItem>
          </>
        ) : (
          <BreadcrumbItem>
            <BreadcrumbPage>Tickets</BreadcrumbPage>
          </BreadcrumbItem>
        )}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
