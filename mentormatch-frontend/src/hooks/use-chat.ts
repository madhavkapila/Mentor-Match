"use client";

import { useState, useCallback, useRef } from "react";
import { apiPost } from "@/lib/axios";
import type { ChatMessage, ChatRequest, ChatResponse } from "@/types/chat";
import type { ApiError } from "@/lib/axios";
import { toast } from "sonner";

interface UseChatReturn {
  messages: ChatMessage[];
  isLoading: boolean;
  isCircuitOpen: boolean;
  circuitRetryIn: number;
  hasSession: boolean;
  sendMessage: (text: string, turnstileToken?: string) => Promise<void>;
  resetChat: () => void;
}

export function useChat(): UseChatReturn {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isCircuitOpen, setIsCircuitOpen] = useState(false);
  const [circuitRetryIn, setCircuitRetryIn] = useState(0);
  const sessionIdRef = useRef<string | null>(null);
  const circuitTimerRef = useRef<NodeJS.Timeout | null>(null);

  const startCircuitBreaker = useCallback(() => {
    setIsCircuitOpen(true);
    let remaining = 30;
    setCircuitRetryIn(remaining);

    circuitTimerRef.current = setInterval(() => {
      remaining -= 1;
      setCircuitRetryIn(remaining);
      if (remaining <= 0) {
        clearInterval(circuitTimerRef.current!);
        setIsCircuitOpen(false);
        setCircuitRetryIn(0);
      }
    }, 1000);
  }, []);

  const sendMessage = useCallback(
    async (text: string, turnstileToken?: string) => {
      if (isLoading || isCircuitOpen || !text.trim()) return;

      const userMessage: ChatMessage = {
        id: `user-${Date.now()}`,
        role: "user",
        content: text.trim(),
        created_at: new Date().toISOString(),
      };

      // Optimistic insert
      setMessages((prev) => [...prev, userMessage]);
      setIsLoading(true);

      // Placeholder for streaming effect
      const streamId = `assistant-${Date.now()}`;
      const streamPlaceholder: ChatMessage = {
        id: streamId,
        role: "assistant",
        content: "",
        created_at: new Date().toISOString(),
        isStreaming: true,
      };
      setMessages((prev) => [...prev, streamPlaceholder]);

      try {
        // Session-gated Turnstile: only send token on the first message
        // (when no session exists yet). Subsequent messages reuse the
        // already-verified session — Cloudflare tokens are single-use.
        const payload: ChatRequest = {
          message: text.trim(),
          session_id: sessionIdRef.current,
          turnstile_token: sessionIdRef.current ? undefined : (turnstileToken || undefined),
        };

        const response = await apiPost<ChatRequest, ChatResponse>(
          "/api/v1/chat",
          payload
        );

        // Track session for multi-turn
        sessionIdRef.current = response.session_id;

        // Replace placeholder with real response (streaming simulation)
        // response.message is a plain string — ChatVat passthrough format
        const fullContent = response.message;
        let currentIndex = 0;

        const streamInterval = setInterval(() => {
          currentIndex += 3; // 3 chars at a time for speed
          if (currentIndex >= fullContent.length) {
            currentIndex = fullContent.length;
            clearInterval(streamInterval);
            setMessages((prev) =>
              prev.map((m) =>
                m.id === streamId
                  ? {
                      ...m,
                      content: fullContent,
                      created_at: new Date().toISOString(),
                      isStreaming: false,
                    }
                  : m
              )
            );
            setIsLoading(false);
          } else {
            setMessages((prev) =>
              prev.map((m) =>
                m.id === streamId
                  ? { ...m, content: fullContent.slice(0, currentIndex) }
                  : m
              )
            );
          }
        }, 15);
      } catch (err: unknown) {
        const error = err as ApiError;

        // Remove streaming placeholder
        setMessages((prev) => prev.filter((m) => m.id !== streamId));
        setIsLoading(false);

        if (error.isCircuitOpen) {
          startCircuitBreaker();
          toast.error("MentorMatch is taking a break. Retrying shortly...");
        } else if (error.isRateLimit) {
          toast.error("Too many messages! Please wait a moment.");
        } else if (error.status === 400) {
          toast.error(error.detail || "Your message couldn't be processed.");
          // Remove the user message on bad input
          setMessages((prev) =>
            prev.filter((m) => m.id !== userMessage.id)
          );
        } else {
          toast.error(error.detail || "Something went wrong. Please try again.");
        }
      }
    },
    [isLoading, isCircuitOpen, startCircuitBreaker]
  );

  const resetChat = useCallback(() => {
    setMessages([]);
    sessionIdRef.current = null;
    setIsLoading(false);
    setIsCircuitOpen(false);
    if (circuitTimerRef.current) {
      clearInterval(circuitTimerRef.current);
    }
  }, []);

  return {
    messages,
    isLoading,
    isCircuitOpen,
    circuitRetryIn,
    hasSession: !!sessionIdRef.current,
    sendMessage,
    resetChat,
  };
}
