import { Loader2Icon } from "lucide-react";

import { cn } from "@asym/ui/lib/utils";

function Spinner({ className, ...props }: React.ComponentProps<"svg">) {
  return (
    <Loader2Icon
      role="status"
      aria-label="Loading"
      className={cn("size-4 spinner-essential", className)}
      {...props}
    />
  );
}

export { Spinner };
