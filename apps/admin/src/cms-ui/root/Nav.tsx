import { Badge } from "@asym/ui/components/shadcn/badge";
import { Card, CardContent } from "@asym/ui/components/shadcn/card";

export function Nav() {
  return (
    <div className="payload-admin-wrapper px-4 pt-4 pb-2">
      <Card className="border-border bg-card shadow-sm">
        <CardContent className="flex items-center justify-between px-3 py-2.5">
          <div className="flex flex-col">
            <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
              Mission Control
            </span>
            <span className="text-xs font-semibold uppercase tracking-[0.16em] text-foreground">
              Site Studio
            </span>
          </div>
          <Badge
            variant="secondary"
            className="rounded-full text-[10px] font-semibold uppercase tracking-[0.12em]"
          >
            Payload
          </Badge>
        </CardContent>
      </Card>
    </div>
  );
}
