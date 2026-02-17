"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { cn } from "@/lib/utils";
import { GraduationCap, User } from "lucide-react";
import { motion } from "framer-motion";
import type { ChatMessage } from "@/types/chat";

interface ChatBubbleProps {
  message: ChatMessage;
}

export function ChatBubble({ message }: ChatBubbleProps) {
  const isUser = message.role === "user";

  return (
    <motion.div
      initial={{ opacity: 0, y: 12, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number] }}
      className={cn("flex gap-3.5 w-full", isUser ? "justify-end" : "justify-start")}
    >
      {/* Assistant avatar */}
      {!isUser && (
        <div className="flex-shrink-0 w-9 h-9 rounded-xl bg-gradient-to-br from-primary/15 to-cyan-500/10 border border-primary/20 flex items-center justify-center mt-0.5 shadow-[0_0_12px_rgba(6,182,212,0.1)]">
          <GraduationCap className="w-4.5 h-4.5 text-primary" />
        </div>
      )}

      <div
        className={cn(
          "max-w-[80%] rounded-2xl px-5 py-3 text-[15px]",
          isUser
            ? "bg-primary text-primary-foreground rounded-br-md shadow-[0_0_20px_rgba(6,182,212,0.15)]"
            : "bg-card/60 border border-border/40 rounded-bl-md"
        )}
      >
        {isUser ? (
          <p className="whitespace-pre-wrap leading-relaxed">{message.content}</p>
        ) : (
          <div className="prose-chat">
            {message.isStreaming && !message.content ? (
              <TypingDots />
            ) : (
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {message.content}
              </ReactMarkdown>
            )}
            {message.isStreaming && message.content && (
              <span className="inline-block w-1.5 h-5 bg-primary/60 animate-pulse ml-0.5 align-middle rounded-full" />
            )}
          </div>
        )}
      </div>

      {/* User avatar */}
      {isUser && (
        <div className="flex-shrink-0 w-9 h-9 rounded-xl bg-primary flex items-center justify-center mt-0.5 shadow-[0_0_12px_rgba(6,182,212,0.15)]">
          <User className="w-4.5 h-4.5 text-primary-foreground" />
        </div>
      )}
    </motion.div>
  );
}

function TypingDots() {
  return (
    <div className="flex gap-1.5 py-2">
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="w-2 h-2 rounded-full bg-primary/40"
          animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1, 0.8] }}
          transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }}
        />
      ))}
    </div>
  );
}
