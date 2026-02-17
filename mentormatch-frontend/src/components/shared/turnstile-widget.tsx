"use client";

import { Turnstile } from "react-turnstile";
import { env } from "@/lib/env";

interface TurnstileWidgetProps {
  onVerify: (token: string | null) => void;
}

export function TurnstileWidget({ onVerify }: TurnstileWidgetProps) {
  const siteKey = env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

  // If no site key configured, auto-pass with test token for development
  if (!siteKey) {
    // Auto-set test token for development
    if (typeof window !== "undefined") {
      setTimeout(() => onVerify("test"), 100);
    }
    return null;
  }

  return (
    <Turnstile
      sitekey={siteKey}
      onVerify={(token) => onVerify(token)}
      onExpire={() => onVerify(null)}
      onError={() => onVerify(null)}
      size="invisible"
    />
  );
}
