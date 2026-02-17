"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuthStore } from "@/lib/auth";
import { cn } from "@/lib/utils";
import type { AuthUser, UserRole } from "@/types/auth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  LayoutDashboard,
  BarChart3,
  MessageSquare,
  Users,
  Database,
  LogOut,
  ChevronRight,
  Menu,
  X,
} from "lucide-react";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard, minRole: "viewer" as const },
  { href: "/dashboard/analytics", label: "Analytics", icon: BarChart3, minRole: "viewer" as const },
  { href: "/dashboard/feedback", label: "Feedback", icon: MessageSquare, minRole: "editor" as const },
  { href: "/dashboard/users", label: "Users", icon: Users, minRole: "admin" as const },
  { href: "/dashboard/sql", label: "SQL Console", icon: Database, minRole: "super_admin" as const },
];

function SidebarContent({
  pathname,
  user,
  checkRole,
  handleLogout,
  initials,
  onNavClick,
}: {
  pathname: string;
  user: AuthUser | null;
  checkRole: (minRole: UserRole) => boolean;
  handleLogout: () => void;
  initials: string;
  onNavClick?: () => void;
}) {
  return (
    <>
      {/* Brand */}
      <div className="h-14 flex items-center gap-2 px-5 border-b border-border/40">
        <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center">
          <span className="text-xs font-bold text-primary-foreground">M</span>
        </div>
        <span className="text-sm font-semibold tracking-tight">MentorMatch</span>
        <Badge variant="outline" className="ml-auto text-[10px] border-primary/30 text-primary">
          Admin
        </Badge>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {NAV_ITEMS.map((item) => {
          if (!checkRole(item.minRole)) return null;
          const isActive =
            item.href === "/dashboard"
              ? pathname === "/dashboard"
              : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavClick}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all group relative",
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              )}
            >
              <item.icon className="w-4 h-4 flex-shrink-0" />
              <span className="flex-1">{item.label}</span>
              {isActive && (
                <motion.div
                  layoutId="sidebar-indicator"
                  className="absolute left-0 top-1 bottom-1 w-[3px] bg-primary rounded-full"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
              {isActive && (
                <ChevronRight className="w-3.5 h-3.5 text-primary/50" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* User & Logout */}
      <div className="border-t border-border/40 p-3 space-y-2">
        <div className="flex items-center gap-3 px-3 py-2">
          <Avatar className="w-8 h-8">
            <AvatarImage src={user?.picture} alt={user?.name} />
            <AvatarFallback className="bg-primary/10 text-primary text-xs">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{user?.name}</p>
            <p className="text-xs text-muted-foreground truncate">{user?.role?.replace("_", " ")}</p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start gap-2 text-muted-foreground hover:text-red-400 hover:bg-red-950/20"
          onClick={handleLogout}
        >
          <LogOut className="w-4 h-4" />
          Sign out
        </Button>
      </div>
    </>
  );
}

export default function DashboardSidebarLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { user, logout, checkRole } = useAuthStore();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    window.location.href = "/";
  };

  const initials = user?.name
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2) ?? "?";

  return (
    <div className="flex h-screen bg-background text-foreground">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-64 flex-shrink-0 border-r border-border/40 flex-col bg-card/30">
        <SidebarContent
          pathname={pathname}
          user={user}
          checkRole={checkRole}
          handleLogout={handleLogout}
          initials={initials}
        />
      </aside>

      {/* Mobile sidebar overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
              onClick={() => setMobileOpen(false)}
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="fixed inset-y-0 left-0 z-50 w-64 flex flex-col bg-card border-r border-border/40 lg:hidden"
            >
              <SidebarContent
                pathname={pathname}
                user={user}
                checkRole={checkRole}
                handleLogout={handleLogout}
                initials={initials}
                onNavClick={() => setMobileOpen(false)}
              />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto">
        {/* Mobile header */}
        <div className="lg:hidden sticky top-0 z-30 h-14 flex items-center gap-3 px-4 border-b border-border/40 bg-background/80 backdrop-blur-xl">
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9"
            onClick={() => setMobileOpen(true)}
          >
            <Menu className="w-4 h-4" />
          </Button>
          <span className="text-sm font-semibold">MentorMatch Admin</span>
        </div>
        <div className="p-4 sm:p-6 lg:p-8 max-w-7xl">{children}</div>
      </main>
    </div>
  );
}
