"use client";

import { useAuthStore } from "@/lib/auth";
import type { UserRole } from "@/types/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ShieldAlert } from "lucide-react";

interface RoleGuardProps {
  minRole: UserRole;
  children: React.ReactNode;
}

export function RoleGuard({ minRole, children }: RoleGuardProps) {
  const checkRole = useAuthStore((state) => state.checkRole);

  if (!checkRole(minRole)) {
    return (
      <div className="flex items-center justify-center p-12">
        <Card className="max-w-md w-full border-destructive/30">
          <CardHeader className="text-center">
            <ShieldAlert className="w-12 h-12 text-destructive mx-auto mb-2" />
            <CardTitle>Insufficient Permissions</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-sm text-muted-foreground">
              You need <span className="font-semibold text-foreground">{minRole}</span> access
              or higher to view this section.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
}
