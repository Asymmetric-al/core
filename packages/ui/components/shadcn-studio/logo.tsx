import LogoSvg from "../logo-svg";
import { cn } from "@asym/ui/lib/utils";

const Logo = ({ className }: { className?: string }) => {
  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <LogoSvg className="size-8.5" />
      <span className="text-xl font-semibold">asymmetric.al</span>
    </div>
  );
};

export default Logo;
