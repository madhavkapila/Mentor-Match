"use client";

import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, Timer } from "lucide-react";

interface CircuitBreakerBannerProps {
  isOpen: boolean;
  retryIn: number;
}

export function CircuitBreakerBanner({ isOpen, retryIn }: CircuitBreakerBannerProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: -20, height: 0 }}
          animate={{ opacity: 1, y: 0, height: "auto" }}
          exit={{ opacity: 0, y: -20, height: 0 }}
          className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-4 mx-4 mt-4"
        >
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-medium text-amber-500">
                MentorMatch is taking a short break
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Our AI service is temporarily unavailable. We&apos;ll automatically retry.
              </p>
            </div>
            <div className="flex items-center gap-1.5 bg-amber-500/10 px-3 py-1.5 rounded-full">
              <Timer className="w-3.5 h-3.5 text-amber-500" />
              <span className="text-sm font-mono font-medium text-amber-500">
                {retryIn}s
              </span>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
