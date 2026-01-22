"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@asym/ui/components/shadcn/button";
import { AlertCircle, RefreshCw } from "lucide-react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const router = useRouter();
  const [isRetrying, setIsRetrying] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    console.error("Application error:", error);
  }, [error]);

  const handleRetry = useCallback(() => {
    setIsRetrying(true);
    setRetryCount((prev) => prev + 1);

    if (retryCount >= 1) {
      window.location.reload();
      return;
    }

    reset();
    router.refresh();

    setTimeout(() => {
      setIsRetrying(false);
    }, 1000);
  }, [reset, router, retryCount]);

  const handleGoHome = useCallback(() => {
    window.location.href = "/";
  }, []);

  return (
    <div className="flex min-h-[400px] flex-col items-center justify-center gap-4 p-8">
      <div className="rounded-full bg-destructive/10 p-3">
        <AlertCircle className="h-6 w-6 text-destructive" />
      </div>
      <h2 className="text-xl font-semibold">Something went wrong</h2>
      <p className="text-center text-muted-foreground max-w-md">
        An unexpected error occurred. Please try again or contact support if the
        problem persists.
      </p>
      {error.digest && (
        <p className="text-xs text-muted-foreground">
          Error ID: {error.digest}
        </p>
      )}
      <div className="flex gap-2">
        <Button onClick={handleRetry} disabled={isRetrying}>
          {isRetrying ? (
            <>
              <RefreshCw className="h-4 w-4 animate-spin mr-2" />
              Retrying...
            </>
          ) : (
            "Try again"
          )}
        </Button>
        <Button variant="outline" onClick={handleGoHome}>
          Go home
        </Button>
      </div>
    </div>
  );
}
