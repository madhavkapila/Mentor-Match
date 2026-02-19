"use client";

import { useRef, useEffect, useCallback, useState } from "react";
import { useChat } from "@/hooks/use-chat";
import { ChatBubble } from "@/components/chat/chat-bubble";
import { InputArea } from "@/components/chat/input-area";
import { CircuitBreakerBanner } from "@/components/chat/circuit-breaker-banner";
import { ChatErrorBoundary } from "@/components/chat/chat-error-boundary";
import { SuggestedPrompts } from "@/components/chat/suggested-prompts";
import { ScrollArea } from "@/components/ui/scroll-area";
import { TurnstileWidget } from "@/components/shared/turnstile-widget";
import { apiPost } from "@/lib/axios";

export default function ChatPage() {
  const {
    messages,
    isLoading,
    isCircuitOpen,
    circuitRetryIn,
    hasSession,
    sendMessage,
    resetChat,
  } = useChat();

  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Record a real human visit (once per browser session)
  useEffect(() => {
    if (typeof window === "undefined") return;
    const key = "mm_visit_recorded";
    if (!sessionStorage.getItem(key)) {
      sessionStorage.setItem(key, "1");
      apiPost<Record<string, never>, unknown>("/api/v1/visit", {}).catch(() => {});
    }
  }, []);

  const handleSuggestedPrompt = useCallback(
    (text: string) => {
      sendMessage(text, turnstileToken || undefined);
    },
    [sendMessage, turnstileToken]
  );

  const isEmpty = messages.length === 0;

  return (
    <ChatErrorBoundary onReset={resetChat}>
      <div className="flex flex-col flex-1 w-full relative">
        {/* Floating orbs — only visible on empty state */}
        {isEmpty && (
          <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden>
            <div className="orb orb-cyan w-[500px] h-[500px] -top-40 -left-40 animate-float-slow opacity-40" />
            <div className="orb orb-blue w-[400px] h-[400px] top-1/3 -right-32 animate-float-reverse opacity-30" />
            <div className="orb orb-teal w-[300px] h-[300px] bottom-20 left-1/4 animate-float-delay-2 opacity-25" />
          </div>
        )}

        {/* Circuit Breaker Banner */}
        <CircuitBreakerBanner isOpen={isCircuitOpen} retryIn={circuitRetryIn} />

        {/* Messages / Hero Area */}
        <ScrollArea className="flex-1 p-4" ref={scrollRef}>
          {isEmpty ? (
            <div className="flex flex-col items-center justify-center min-h-[60vh] relative z-10">
              <SuggestedPrompts onSelect={handleSuggestedPrompt} />
            </div>
          ) : (
            <div className="space-y-4 pb-4 max-w-3xl mx-auto">
              {messages.map((message) => (
                <ChatBubble key={message.id} message={message} />
              ))}
            </div>
          )}
        </ScrollArea>

        {/* Turnstile widget */}
        {!hasSession && (
          <div className="flex justify-center">
            <TurnstileWidget onVerify={setTurnstileToken} />
          </div>
        )}

        {/* Input Area */}
        <InputArea
          onSend={sendMessage}
          isLoading={isLoading}
          isDisabled={isCircuitOpen}
          hasSession={hasSession}
          turnstileToken={turnstileToken}
        />
      </div>
    </ChatErrorBoundary>
  );
}
