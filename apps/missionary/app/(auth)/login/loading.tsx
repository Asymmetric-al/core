import { Skeleton } from "@asym/ui/components/shadcn/skeleton";

export default function LoginLoading() {
  return (
    <div
      className="flex min-h-[50vh] flex-col items-center justify-center gap-6 p-6"
      aria-busy="true"
      aria-label="Loading sign-in"
    >
      <Skeleton className="h-10 w-48" />
      <Skeleton className="h-4 w-72 max-w-full" />
      <Skeleton className="h-64 w-full max-w-md rounded-xl" />
    </div>
  );
}
