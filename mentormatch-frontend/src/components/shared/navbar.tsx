"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { GraduationCap, Info, MessageSquarePlus, Menu, X } from "lucide-react";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { href: "/about", label: "About", icon: Info },
  { href: "/contact", label: "Feedback", icon: MessageSquarePlus },
];

export function Navbar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-border/40 bg-background/60 backdrop-blur-xl supports-backdrop-filter:bg-background/40">
      <div className="max-w-6xl mx-auto flex items-center justify-between px-4 sm:px-6 h-16">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <motion.div
            whileHover={{ scale: 1.08, rotate: 3 }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/15 to-cyan-500/10 flex items-center justify-center border border-primary/20 group-hover:border-primary/40 transition-all group-hover:shadow-[0_0_20px_rgba(6,182,212,0.12)]"
          >
            <GraduationCap className="w-5 h-5 text-primary" />
          </motion.div>
          <span className="font-bold text-xl tracking-tight">
            Mentor<span className="text-primary">Match</span>
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden sm:flex items-center gap-1.5">
          {NAV_LINKS.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Button
                key={link.href}
                variant="ghost"
                size="sm"
                asChild
                className={cn(
                  "gap-2 relative transition-colors h-9 px-4",
                  isActive && "text-primary"
                )}
              >
                <Link href={link.href}>
                  <link.icon className="w-4 h-4" />
                  <span className="font-medium">{link.label}</span>
                  {isActive && (
                    <motion.div
                      layoutId="nav-indicator"
                      className="absolute -bottom-[13px] left-3 right-3 h-[2px] bg-primary rounded-full shadow-[0_0_8px_rgba(6,182,212,0.4)]"
                      transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    />
                  )}
                </Link>
              </Button>
            );
          })}
          <div className="w-px h-6 bg-border/60 mx-2" />
          <ThemeToggle />
        </nav>

        {/* Mobile menu button */}
        <div className="flex sm:hidden items-center gap-1">
          <ThemeToggle />
          <Button
            variant="ghost"
            size="icon"
            className="h-10 w-10"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="sm:hidden border-t border-border/40 bg-background/90 backdrop-blur-xl overflow-hidden"
          >
            <nav className="flex flex-col px-4 py-3 gap-1">
              {NAV_LINKS.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    className={cn(
                      "flex items-center gap-3 px-4 py-3 rounded-xl text-base font-medium transition-colors",
                      isActive
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                    )}
                  >
                    <link.icon className="w-5 h-5" />
                    {link.label}
                  </Link>
                );
              })}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
