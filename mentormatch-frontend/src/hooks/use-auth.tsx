"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/lib/auth";

export function AuthHydrator({ children }: { children: React.ReactNode }) {
  const hydrate = useAuthStore((state) => state.hydrate);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  return <>{children}</>;
}
