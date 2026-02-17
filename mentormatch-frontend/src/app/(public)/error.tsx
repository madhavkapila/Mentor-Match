"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Unhandled error:", error);
  }, [error]);

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <AlertTriangle className="w-16 h-16 text-destructive mx-auto mb-4" />
        <h2 className="text-2xl font-bold">Something went wrong</h2>
        <p className="text-muted-foreground mt-2 text-sm">
          An unexpected error occurred. Please try again.
        </p>
        <Button onClick={reset} className="mt-6">
          Try Again
        </Button>
      </div>
    </div>
  );
}
