import { brandConfig } from "@asym/config/site";
import { Badge } from "@asym/ui/components/shadcn/badge";

export function Logo() {
  return (
    <div className="flex items-center gap-2 text-foreground">
      <span className="inline-flex size-8 items-center justify-center rounded-lg bg-primary text-xs font-black text-primary-foreground">
        {brandConfig.shortName}
      </span>
      <div className="flex flex-col leading-none">
        <span className="text-xs font-black tracking-[0.22em] uppercase text-foreground">
          {brandConfig.name}
        </span>
        <div className="mt-1 flex items-center gap-1.5">
          <span className="text-[10px] font-semibold tracking-[0.18em] uppercase text-muted-foreground">
            Site Studio
          </span>
          <Badge
            variant="secondary"
            className="h-4 rounded-full px-1.5 text-[9px] font-semibold uppercase"
          >
            CMS
          </Badge>
        </div>
      </div>
    </div>
  );
}
