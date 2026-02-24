import { Badge } from "@asym/ui/components/shadcn/badge";
import { Card, CardContent } from "@asym/ui/components/shadcn/card";

export function Header() {
  return (
    <div className="payload-admin-wrapper">
      <Card className="border-border bg-card shadow-sm">
        <CardContent className="flex items-center justify-between gap-3 px-3 py-2">
          <div className="flex items-center gap-2 text-xs font-semibold text-foreground">
            <span className="inline-flex h-2 w-2 rounded-full bg-emerald-500" />
            Tenant-safe publishing is active
          </div>
          <Badge
            variant="outline"
            className="text-[10px] font-semibold uppercase tracking-[0.12em]"
          >
            staff only
          </Badge>
        </CardContent>
      </Card>
    </div>
  );
}
