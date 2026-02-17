"use client";

import { motion } from "framer-motion";
import { GraduationCap, Search, BookOpen, Users, ArrowRight, Sparkles, Terminal } from "lucide-react";

const suggestions = [
  {
    icon: Search,
    text: "Find me a mentor for NLP research",
    detail: "Natural language processing faculty",
    gradient: "from-cyan-500/20 to-blue-500/20",
  },
  {
    icon: Users,
    text: "Who supervises Machine Learning projects?",
    detail: "ML & AI capstone mentors",
    gradient: "from-blue-500/20 to-indigo-500/20",
  },
  {
    icon: BookOpen,
    text: "Faculty in CSE department",
    detail: "Browse department members",
    gradient: "from-teal-500/20 to-emerald-500/20",
  },
  {
    icon: GraduationCap,
    text: "Mentors for computer vision capstone",
    detail: "Vision & image processing",
    gradient: "from-violet-500/20 to-cyan-500/20",
  },
];

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08, delayChildren: 0.3 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number] },
  },
};

interface SuggestedPromptsProps {
  onSelect: (text: string) => void;
}

export function SuggestedPrompts({ onSelect }: SuggestedPromptsProps) {
  return (
    <div className="flex flex-col items-center justify-center h-full px-4 max-w-2xl mx-auto">
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number] }}
        className="text-center mb-12"
      >
        {/* Animated Logo */}
        <motion.div
          initial={{ scale: 0.5, opacity: 0, rotateY: -30 }}
          animate={{ scale: 1, opacity: 1, rotateY: 0 }}
          transition={{ delay: 0.1, type: "spring", stiffness: 150, damping: 15 }}
          className="relative mx-auto mb-8"
        >
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-cyan-500/20 via-primary/10 to-blue-500/20 flex items-center justify-center mx-auto border border-primary/20 shadow-[0_0_40px_rgba(6,182,212,0.15)]">
            <GraduationCap className="w-10 h-10 text-primary" />
          </div>
          {/* Decorative ring */}
          <div className="absolute -inset-3 rounded-[2rem] border border-primary/10 animate-pulse-glow" />
        </motion.div>

        {/* Large title */}
        <motion.h1
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="text-4xl sm:text-5xl font-bold tracking-tight mb-4"
        >
          Ask{" "}
          <span className="gradient-text">MentorMatch</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, duration: 0.5 }}
          className="text-lg sm:text-xl text-muted-foreground max-w-md mx-auto leading-relaxed"
        >
          AI-powered academic mentor finder for Thapar Institute. Find the perfect faculty for your capstone.
        </motion.p>

        {/* Floating badge */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5, type: "spring" }}
          className="flex flex-col items-center gap-3 mt-6"
        >
          <a
            href="https://pypi.org/project/chatvat/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary/20 bg-primary/5 text-primary text-sm font-medium hover:bg-primary/10 hover:border-primary/30 transition-all btn-3d"
          >
            <Sparkles className="w-4 h-4" />
            Powered by ChatVat
          </a>
          <a
            href="https://pypi.org/project/chatvat/"
            target="_blank"
            rel="noopener noreferrer"
            className="terminal-inline hover:border-primary/30 transition-colors"
          >
            <Terminal className="w-3.5 h-3.5 opacity-60" />
            <span>pip install chatvat</span>
          </a>
        </motion.div>
      </motion.div>

      {/* Suggestion Cards */}
      <motion.div
        className="perspective-container grid grid-cols-1 sm:grid-cols-2 gap-3 w-full"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {suggestions.map((suggestion, index) => (
          <motion.button
            key={index}
            variants={itemVariants}
            whileHover={{ scale: 1.03, y: -4, transition: { duration: 0.2 } }}
            whileTap={{ scale: 0.97 }}
            onClick={() => onSelect(suggestion.text)}
            className={`relative flex items-start gap-4 px-5 py-4 rounded-2xl border border-border/50 hover:border-primary/40 transition-all text-left group backdrop-blur-sm bg-gradient-to-br ${suggestion.gradient} card-3d-lift`}
          >
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 border border-primary/10 group-hover:border-primary/30 transition-all flex-shrink-0 mt-0.5">
              <suggestion.icon className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[15px] font-medium text-foreground/90 group-hover:text-foreground transition-colors leading-snug">
                {suggestion.text}
              </p>
              <p className="text-xs text-muted-foreground/50 mt-1.5">
                {suggestion.detail}
              </p>
            </div>
            <ArrowRight className="w-4 h-4 text-muted-foreground/20 group-hover:text-primary/60 group-hover:translate-x-1 transition-all flex-shrink-0 mt-1" />
          </motion.button>
        ))}
      </motion.div>
    </div>
  );
}
