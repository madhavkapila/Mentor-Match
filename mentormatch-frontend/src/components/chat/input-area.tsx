"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { ArrowUp, Loader2 } from "lucide-react";

interface InputAreaProps {
  onSend: (message: string, turnstileToken?: string) => Promise<void>;
  isLoading: boolean;
  isDisabled: boolean;
  hasSession: boolean;
  turnstileToken: string | null;
}

export function InputArea({ onSend, isLoading, isDisabled, hasSession, turnstileToken }: InputAreaProps) {
  const [input, setInput] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const canSend =
    input.trim().length > 0 &&
    (hasSession || !!turnstileToken) &&
    !isLoading &&
    !isDisabled;

  const handleSend = useCallback(async () => {
    if (!canSend) return;
    const message = input.trim();
    setInput("");
    await onSend(message, turnstileToken || undefined);
    textareaRef.current?.focus();
  }, [canSend, input, turnstileToken, onSend]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
        e.preventDefault();
        handleSend();
      }
    },
    [handleSend]
  );

  useEffect(() => {
    const el = textareaRef.current;
    if (el) {
      el.style.height = "auto";
      el.style.height = Math.min(el.scrollHeight, 200) + "px";
    }
  }, [input]);

  return (
    <div className="border-t border-border/40 bg-background/60 backdrop-blur-xl">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-4">
        <div className="relative flex items-end gap-3 rounded-2xl border border-border/60 bg-card/60 p-3 focus-within:border-primary/40 focus-within:shadow-[0_0_30px_rgba(6,182,212,0.1)] transition-all backdrop-blur-sm">
          <Textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask about faculty mentors, research areas, or capstone projects..."
            className="min-h-[44px] max-h-[200px] resize-none border-0 bg-transparent shadow-none focus-visible:ring-0 text-[15px] placeholder:text-muted-foreground/50 leading-relaxed"
            rows={1}
            disabled={isDisabled}
          />
          <Button
            onClick={handleSend}
            disabled={!canSend}
            size="icon"
            className="h-10 w-10 shrink-0 rounded-xl bg-primary hover:bg-primary/90 shadow-[0_0_15px_rgba(6,182,212,0.2)] transition-all"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <ArrowUp className="w-4 h-4" />
            )}
          </Button>
        </div>
        <p className="text-[11px] text-muted-foreground/40 text-center mt-2">
          Press Ctrl+Enter to send &middot; AI responses may not always be accurate
        </p>
      </div>
    </div>
  );
}
