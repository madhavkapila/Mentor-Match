"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/auth";
import { AuthHydrator } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";

export default function DashboardGroupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthHydrator>
      <DashboardAuthGate>{children}</DashboardAuthGate>
    </AuthHydrator>
  );
}

/**
 * Secondary client-side auth gate.
 * Primary protection is middleware.ts (server-side).
 * This is a fallback for hydration edge cases.
 */
function DashboardAuthGate({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsChecking(false);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!isChecking && !isAuthenticated) {
      router.replace("/login");
    }
  }, [isChecking, isAuthenticated, router]);

  if (isChecking) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return <>{children}</>;
}
