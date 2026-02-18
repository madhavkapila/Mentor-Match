"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import {
  GraduationCap,
  Brain,
  Search,
  MessageSquare,
  Shield,
  ArrowRight,
  Sparkles,
  Server,
  Lock,
  BarChart3,
  Layers,
  Zap,
  Linkedin,
  Github,
  Code2,
  Trophy,
  BookOpen,
  Award,
} from "lucide-react";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay: i * 0.1, ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number] },
  }),
};

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};

const cardReveal = {
  hidden: { opacity: 0, y: 24, scale: 0.96 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number] },
  },
};

const PIPELINE_STEPS = [
  {
    icon: MessageSquare,
    title: "User Query",
    description:
      "Students type natural-language questions about faculty, mentors, and capstone projects at TIET.",
    color: "text-cyan-400",
    bg: "from-cyan-500/15 to-cyan-500/5",
    ring: "ring-cyan-500/20",
  },
  {
    icon: Shield,
    title: "Security Layer",
    description:
      "Input sanitized through rate limiting, Cloudflare Turnstile, SQL injection guards, and LLM-Guard prompt scanning.",
    color: "text-amber-400",
    bg: "from-amber-500/15 to-amber-500/5",
    ring: "ring-amber-500/20",
  },
  {
    icon: Search,
    title: "Retrieval",
    description:
      "Query embedded and matched against a curated vector store of faculty profiles, research areas, and project history.",
    color: "text-emerald-400",
    bg: "from-emerald-500/15 to-emerald-500/5",
    ring: "ring-emerald-500/20",
  },
  {
    icon: Brain,
    title: "LLM Generation",
    description:
      "Retrieved context is injected into a fine-tuned prompt. The AI generates an accurate, grounded response with citations.",
    color: "text-blue-400",
    bg: "from-blue-500/15 to-blue-500/5",
    ring: "ring-blue-500/20",
  },
  {
    icon: GraduationCap,
    title: "Response",
    description:
      "Markdown-formatted answer delivered to the student, with source references and mentor recommendations.",
    color: "text-primary",
    bg: "from-primary/15 to-primary/5",
    ring: "ring-primary/20",
  },
];

const FEATURES = [
  {
    icon: Sparkles,
    title: "AI-Powered Matching",
    description:
      "RAG pipeline ensures answers are grounded in real faculty data, not hallucinated.",
    gradient: "from-cyan-500/10 to-blue-500/10",
  },
  {
    icon: Lock,
    title: "Enterprise Security",
    description:
      "4-layer defense: Turnstile CAPTCHA, SQLi guards, prompt injection scanning, and rate limiting.",
    gradient: "from-amber-500/10 to-orange-500/10",
  },
  {
    icon: Zap,
    title: "Real-time Streaming",
    description:
      "Responses stream token-by-token for instant feedback while the model generates.",
    gradient: "from-emerald-500/10 to-teal-500/10",
  },
  {
    icon: BarChart3,
    title: "Admin Dashboard",
    description:
      "Role-based admin panel with analytics, feedback management, and system monitoring.",
    gradient: "from-blue-500/10 to-indigo-500/10",
  },
  {
    icon: Layers,
    title: "Modular Architecture",
    description:
      "Clean separation between frontend, backend, and AI engine for easy scaling.",
    gradient: "from-violet-500/10 to-purple-500/10",
  },
  {
    icon: Server,
    title: "Production Ready",
    description:
      "Docker-compose deployment, Nginx reverse proxy, and automated CI/CD pipeline.",
    gradient: "from-pink-500/10 to-rose-500/10",
  },
];

const TECH_STACK = [
  {
    label: "Frontend",
    items: ["Next.js 16", "TypeScript", "Tailwind CSS v4", "Shadcn/UI"],
    accent: "border-cyan-500/30",
    glow: "hover:shadow-[0_0_30px_rgba(6,182,212,0.08)]",
  },
  {
    label: "Backend",
    items: ["FastAPI", "PostgreSQL 15", "SQLAlchemy", "Pydantic v2"],
    accent: "border-emerald-500/30",
    glow: "hover:shadow-[0_0_30px_rgba(16,185,129,0.08)]",
  },
  {
    label: "AI / ML",
    items: ["RAG Pipeline", "Vector Store", "LLM-Guard", "Custom Prompts"],
    accent: "border-blue-500/30",
    glow: "hover:shadow-[0_0_30px_rgba(59,130,246,0.08)]",
  },
  {
    label: "Security",
    items: ["JWT Auth", "Google OAuth", "Cloudflare Turnstile", "Rate Limiting"],
    accent: "border-amber-500/30",
    glow: "hover:shadow-[0_0_30px_rgba(245,158,11,0.08)]",
  },
  {
    label: "Infrastructure",
    items: ["Docker", "Nginx", "ChatVat", "AWS", "GitHub Actions"],
    accent: "border-primary/30",
    glow: "hover:shadow-[0_0_30px_rgba(6,182,212,0.08)]",
  },
  {
    label: "Monitoring",
    items: ["System Monitor", "Security Logs", "Admin Dashboard", "Feedback Loop"],
    accent: "border-pink-500/30",
    glow: "hover:shadow-[0_0_30px_rgba(236,72,153,0.08)]",
  },
];

const TECH_LOGOS = [
  { name: "Next.js", src: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/nextjs/nextjs-original.svg" },
  { name: "React", src: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/react/react-original.svg" },
  { name: "TypeScript", src: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/typescript/typescript-original.svg" },
  { name: "Tailwind", src: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/tailwindcss/tailwindcss-original.svg" },
  { name: "Python", src: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/python/python-original.svg" },
  { name: "FastAPI", src: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/fastapi/fastapi-original.svg" },
  { name: "PostgreSQL", src: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/postgresql/postgresql-original.svg" },
  { name: "Docker", src: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/docker/docker-original.svg" },
  { name: "Nginx", src: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/nginx/nginx-original.svg" },
  { name: "AWS", src: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/amazonwebservices/amazonwebservices-plain-wordmark.svg" },
];

export default function AboutPage() {
  return (
    <div className="relative">
      {/* Floating background orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10" aria-hidden>
        <div className="orb orb-cyan w-[600px] h-[600px] -top-60 -right-40 animate-float-slow opacity-30" />
        <div className="orb orb-blue w-[500px] h-[500px] top-[40%] -left-60 animate-float-reverse opacity-20" />
        <div className="orb orb-teal w-[400px] h-[400px] bottom-20 right-10 animate-float-delay-1 opacity-15" />
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-20 sm:py-28 space-y-32">
        {/* Hero */}
        <motion.section
          initial="hidden"
          animate="visible"
          className="text-center space-y-8"
        >
          <motion.div variants={fadeUp} custom={0} className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary/20 bg-primary/5 text-primary text-sm font-medium">
            <Sparkles className="w-4 h-4" />
            Academic RAG Platform
          </motion.div>

          <motion.h1 variants={fadeUp} custom={1} className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.1]">
            Meet{" "}
            <span className="gradient-text">
              MentorMatch
            </span>
          </motion.h1>

          <motion.p variants={fadeUp} custom={2} className="text-xl sm:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed font-light">
            An AI-powered academic mentor finder built for Thapar Institute of
            Engineering & Technology. Leveraging Retrieval-Augmented Generation to
            connect students with the right faculty and capstone mentors.
          </motion.p>

          {/* Hero stats */}
          <motion.div
            variants={fadeUp}
            custom={3}
            className="flex items-center justify-center gap-8 sm:gap-12 pt-4"
          >
            {[
              { value: "RAG", label: "Pipeline" },
              { value: "4-Layer", label: "Security" },
              { value: "Real-time", label: "Streaming" },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="text-2xl sm:text-3xl font-bold text-primary">{stat.value}</p>
                <p className="text-xs sm:text-sm text-muted-foreground mt-1">{stat.label}</p>
              </div>
            ))}
          </motion.div>
        </motion.section>

        {/* Tech Logos Strip */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.6 }}
          className="text-center space-y-6"
        >
          <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
            Built with industry-grade technologies
          </p>
          <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-10">
            {TECH_LOGOS.map((t) => (
              <motion.div
                key={t.name}
                whileHover={{ scale: 1.15, y: -4 }}
                transition={{ type: "spring", stiffness: 300 }}
                className="flex flex-col items-center gap-2 group"
                title={t.name}
              >
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-muted/50 border border-border/50 flex items-center justify-center group-hover:border-primary/30 group-hover:bg-primary/5 transition-all">
                  <img
                    src={t.src}
                    alt={t.name}
                    className="w-7 h-7 sm:w-8 sm:h-8 object-contain"
                    loading="lazy"
                  />
                </div>
                <span className="text-[11px] text-muted-foreground/60 group-hover:text-muted-foreground transition-colors">
                  {t.name}
                </span>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Features Bento Grid */}
        <section>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6 }}
            className="text-center mb-14"
          >
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">Key Features</h2>
            <p className="text-muted-foreground text-lg mt-3 max-w-xl mx-auto">
              What makes MentorMatch different
            </p>
          </motion.div>

          <motion.div
            className="perspective-container grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-60px" }}
            variants={stagger}
          >
            {FEATURES.map((feature) => (
              <motion.div key={feature.title} variants={cardReveal}>
                <Card className={`group hover:border-primary/30 transition-all duration-300 bg-gradient-to-br ${feature.gradient} border-border/40 h-full card-3d-tilt`}>
                  <CardContent className="pt-7 pb-6 px-6 space-y-4">
                    <motion.div
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      transition={{ type: "spring", stiffness: 300 }}
                      className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/15 border border-primary/10 group-hover:border-primary/25 transition-all shadow-[0_0_15px_rgba(6,182,212,0.1)]"
                    >
                      <feature.icon className="w-6 h-6 text-primary" />
                    </motion.div>
                    <h3 className="font-semibold text-base">{feature.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </section>

        {/* RAG Pipeline */}
        <section>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6 }}
            className="text-center mb-14"
          >
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">How It Works</h2>
            <p className="text-muted-foreground text-lg mt-3 max-w-xl mx-auto">
              The RAG pipeline from query to answer
            </p>
          </motion.div>

          <div className="relative max-w-4xl mx-auto">
            {/* Glowing vertical line — behind icons, offset to avoid overlap */}
            <div className="absolute left-6 sm:left-7 top-0 bottom-0 w-px hidden sm:block -z-0">
              <div className="h-full w-full bg-gradient-to-b from-cyan-500/30 via-emerald-500/25 to-primary/30" />
              <div className="absolute inset-0 bg-gradient-to-b from-cyan-500/10 via-emerald-500/10 to-primary/10 blur-md" />
            </div>

            <div className="space-y-6">
              {PIPELINE_STEPS.map((step, index) => (
                <motion.div
                  key={step.title}
                  initial={{ opacity: 0, x: -30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: "-40px" }}
                  transition={{ duration: 0.5, delay: index * 0.12 }}
                  className="flex items-start gap-5 sm:gap-7"
                >
                  {/* Icon with glow — z-10 so line stays behind */}
                  <motion.div
                    whileHover={{ scale: 1.15, rotate: 5 }}
                    transition={{ type: "spring", stiffness: 300 }}
                    className={`relative z-10 flex-shrink-0 w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-br ${step.bg} flex items-center justify-center border border-border/50 ring-2 ${step.ring} shadow-lg bg-background`}
                  >
                    <step.icon className={`w-6 h-6 sm:w-7 sm:h-7 ${step.color}`} />
                  </motion.div>

                  {/* Content */}
                  <Card className="flex-1 bg-card/50 hover:border-primary/25 transition-all hover:shadow-[0_0_25px_rgba(6,182,212,0.05)]">
                    <CardHeader className="py-4 px-5">
                      <CardTitle className="text-base font-semibold flex items-center gap-3">
                        <span className="text-sm font-mono text-primary/50 bg-primary/5 px-2 py-0.5 rounded-md">
                          0{index + 1}
                        </span>
                        {step.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="px-5 pb-4 pt-0">
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {step.description}
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Tech Stack */}
        <section>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6 }}
            className="text-center mb-14"
          >
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
              Technology Stack
            </h2>
            <p className="text-muted-foreground text-lg mt-3 max-w-xl mx-auto">
              Built with modern, production-grade tools
            </p>
          </motion.div>

          <motion.div
            className="perspective-container grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-60px" }}
            variants={stagger}
          >
            {TECH_STACK.map((category) => (
              <motion.div key={category.label} variants={cardReveal}>
                <Card className={`bg-card/50 border ${category.accent} hover:border-primary/40 transition-all duration-300 h-full card-3d-tilt ${category.glow}`}>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base font-semibold">
                      {category.label}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pb-5">
                    <div className="flex flex-wrap gap-2">
                      {category.items.map((item) => (
                        <Badge
                          key={item}
                          variant="secondary"
                          className="text-xs font-mono hover:bg-primary/10 hover:text-primary transition-colors cursor-default px-3 py-1"
                        >
                          {item}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </section>

        {/* Developer */}
        <section>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6 }}
            className="text-center mb-14"
          >
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
              About the Developer
            </h2>
            <p className="text-muted-foreground text-lg mt-3 max-w-xl mx-auto">
              The person behind MentorMatch
            </p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-60px" }}
            variants={stagger}
            className="max-w-4xl mx-auto"
          >
            <motion.div variants={cardReveal}>
              <Card className="bg-gradient-to-br from-primary/5 via-card/80 to-cyan-500/5 border-primary/20 hover:border-primary/40 transition-all duration-300">
                <CardContent className="pt-8 pb-8 px-6 sm:px-10">
                  <div className="flex flex-col sm:flex-row items-center sm:items-start gap-8">
                    {/* Avatar */}
                    <motion.div
                      whileHover={{ scale: 1.05, rotate: 2 }}
                      transition={{ type: "spring", stiffness: 300 }}
                      className="flex-shrink-0 w-28 h-28 rounded-2xl bg-gradient-to-br from-primary/20 to-cyan-500/20 flex items-center justify-center border border-primary/20 shadow-[0_0_30px_rgba(6,182,212,0.15)]"
                    >
                      <GraduationCap className="w-14 h-14 text-primary" />
                    </motion.div>

                    {/* Info */}
                    <div className="flex-1 text-center sm:text-left space-y-4">
                      <div>
                        <h3 className="text-2xl font-bold">Madhav Kapila</h3>
                        <p className="text-muted-foreground mt-1">
                          B.E. Computer Engineering — Thapar Institute of Engineering &amp; Technology
                        </p>
                        <p className="text-sm text-muted-foreground/70 mt-0.5">
                          CGPA: 9.15 / 10
                        </p>
                      </div>

                      {/* Highlights */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                        {[
                          {
                            icon: Award,
                            text: "Amazon ML Summer School — Top 5% of 80,000+ applicants",
                            color: "text-amber-400",
                          },
                          {
                            icon: BookOpen,
                            text: "DSA Mentor — Creative Computing Society, TIET",
                            color: "text-emerald-400",
                          },
                          {
                            icon: Code2,
                            text: "ChatVat — Published PyPI package for RAG chatbots",
                            color: "text-cyan-400",
                          },
                          {
                            icon: Trophy,
                            text: "400+ competitive programming problems solved",
                            color: "text-blue-400",
                          },
                        ].map((item) => (
                          <div
                            key={item.text}
                            className="flex items-start gap-3 text-sm text-muted-foreground"
                          >
                            <item.icon
                              className={`w-4 h-4 mt-0.5 flex-shrink-0 ${item.color}`}
                            />
                            <span>{item.text}</span>
                          </div>
                        ))}
                      </div>

                      {/* Social Links */}
                      <div className="flex items-center gap-3 pt-3 justify-center sm:justify-start">
                        <a
                          href="https://www.linkedin.com/in/madhav-kapila"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#0A66C2]/10 border border-[#0A66C2]/20 text-[#0A66C2] hover:bg-[#0A66C2]/20 hover:border-[#0A66C2]/30 text-sm font-medium transition-all"
                        >
                          <Linkedin className="w-4 h-4" />
                          LinkedIn
                        </a>
                        <a
                          href="https://github.com/madhavkapila"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-muted/50 border border-border/50 text-foreground hover:bg-muted hover:border-border text-sm font-medium transition-all"
                        >
                          <Github className="w-4 h-4" />
                          GitHub
                        </a>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        </section>

        {/* Footer CTA */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center space-y-6 py-16 border-t border-border/40"
        >
          <p className="text-lg text-muted-foreground">
            Built as a Capstone Project for the Computer Science Department at
            TIET.
          </p>
          <a
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary/10 border border-primary/20 text-primary hover:bg-primary/15 hover:border-primary/30 text-base font-medium group transition-all btn-3d"
          >
            Try MentorMatch
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </a>
        </motion.section>
      </div>
    </div>
  );
}
