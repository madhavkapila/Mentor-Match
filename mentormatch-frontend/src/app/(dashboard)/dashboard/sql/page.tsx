"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { apiPost } from "@/lib/axios";
import type { DBQueryResponse } from "@/types/admin";
import { RoleGuard } from "@/components/admin/role-guard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Database,
  Play,
  AlertTriangle,
  Clock,
  Users,
  MessageSquare,
  Star,
  Activity,
  ChevronDown,
  Table2,
  Key,
  Link2,
} from "lucide-react";

const QUICK_QUERIES = [
  {
    label: "Total Sessions",
    icon: Activity,
    sql: "SELECT COUNT(*) AS total_sessions FROM chat_sessions;",
  },
  {
    label: "Active Users Today",
    icon: Users,
    sql: "SELECT COUNT(DISTINCT session_id) AS active_today FROM chat_messages WHERE created_at >= CURRENT_DATE;",
  },
  {
    label: "Feedback Summary",
    icon: MessageSquare,
    sql: "SELECT COUNT(*) AS total, ROUND(AVG(rating), 2) AS avg_rating, SUM(CASE WHEN is_resolved THEN 1 ELSE 0 END) AS resolved FROM feedback;",
  },
  {
    label: "Top Rated",
    icon: Star,
    sql: "SELECT user_name, rating, message FROM feedback WHERE rating >= 4 ORDER BY created_at DESC LIMIT 10;",
  },
];

const DB_SCHEMA = [
  {
    table: "chat_sessions",
    icon: MessageSquare,
    color: "text-cyan-400",
    accent: "border-cyan-500/30",
    bg: "from-cyan-500/10 to-cyan-500/5",
    description: "Each user conversation session (UUID primary key, tracks IP)",
    columns: [
      { name: "id", type: "UUID", pk: true },
      { name: "created_at", type: "TIMESTAMPTZ" },
      { name: "client_ip", type: "VARCHAR" },
    ],
    relations: ["chat_messages.session_id → id", "feedback.session_id → id"],
  },
  {
    table: "chat_messages",
    icon: Activity,
    color: "text-blue-400",
    accent: "border-blue-500/30",
    bg: "from-blue-500/10 to-blue-500/5",
    description: "Individual messages (user & assistant) within a session",
    columns: [
      { name: "id", type: "SERIAL", pk: true },
      { name: "session_id", type: "UUID", fk: "chat_sessions" },
      { name: "role", type: "VARCHAR", note: "user | assistant" },
      { name: "content", type: "TEXT" },
      { name: "created_at", type: "TIMESTAMPTZ" },
    ],
    relations: ["session_id → chat_sessions.id"],
  },
  {
    table: "feedback",
    icon: Star,
    color: "text-amber-400",
    accent: "border-amber-500/30",
    bg: "from-amber-500/10 to-amber-500/5",
    description: "User feedback with 1-5 star rating, optionally linked to a session",
    columns: [
      { name: "id", type: "SERIAL", pk: true },
      { name: "user_name", type: "VARCHAR" },
      { name: "user_email", type: "VARCHAR" },
      { name: "user_phone", type: "VARCHAR", note: "nullable" },
      { name: "message", type: "TEXT" },
      { name: "rating", type: "INTEGER", note: "1–5" },
      { name: "session_id", type: "UUID", fk: "chat_sessions", note: "nullable" },
      { name: "is_resolved", type: "BOOLEAN" },
      { name: "created_at", type: "TIMESTAMPTZ" },
    ],
    relations: ["session_id → chat_sessions.id"],
  },
  {
    table: "admin_users",
    icon: Users,
    color: "text-emerald-400",
    accent: "border-emerald-500/30",
    bg: "from-emerald-500/10 to-emerald-500/5",
    description: "Admin accounts with role-based access (viewer → super_admin)",
    columns: [
      { name: "id", type: "SERIAL", pk: true },
      { name: "email", type: "VARCHAR", note: "unique" },
      { name: "name", type: "VARCHAR" },
      { name: "picture", type: "VARCHAR" },
      { name: "role", type: "VARCHAR", note: "viewer | editor | admin | super_admin" },
      { name: "is_active", type: "BOOLEAN" },
      { name: "created_at", type: "TIMESTAMPTZ" },
    ],
    relations: [],
  },
  {
    table: "security_events",
    icon: AlertTriangle,
    color: "text-red-400",
    accent: "border-red-500/30",
    bg: "from-red-500/10 to-red-500/5",
    description: "Persisted security incidents — rate limits, SQLi, prompt injection",
    columns: [
      { name: "id", type: "SERIAL", pk: true },
      { name: "event_type", type: "VARCHAR", note: "RATE_LIMIT | SQLI | PROMPT_INJECTION | BANNED_TOPIC" },
      { name: "detail", type: "TEXT" },
      { name: "client_ip", type: "VARCHAR" },
      { name: "created_at", type: "TIMESTAMPTZ" },
    ],
    relations: [],
  },
];

const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" as const } },
};

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06 } },
};

export default function SQLPage() {
  return (
    <RoleGuard minRole="super_admin">
      <SQLContent />
    </RoleGuard>
  );
}

function SQLContent() {
  const [query, setQuery] = useState("SELECT COUNT(*) FROM chat_sessions;");
  const [result, setResult] = useState<DBQueryResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [schemaOpen, setSchemaOpen] = useState(false);

  const handleExecute = async () => {
    if (!query.trim()) return;

    try {
      setLoading(true);
      setError(null);
      setResult(null);
      const res = await apiPost<{ query: string }, DBQueryResponse>(
        "/api/v1/admin/db/query",
        { query }
      );
      setResult(res);
    } catch (err: unknown) {
      const e = err as { detail?: string };
      setError(e?.detail || "Query failed");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
      e.preventDefault();
      handleExecute();
    }
  };

  return (
    <motion.div
      className="space-y-6"
      initial="hidden"
      animate="show"
      variants={stagger}
    >
      {/* Header */}
      <motion.div variants={fadeUp}>
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Database className="w-5 h-5 text-primary" />
          </div>
          SQL Console
        </h1>
        <p className="text-base text-muted-foreground mt-1.5">
          Read-only database queries &middot; Super Admin only
        </p>
      </motion.div>

      {/* Quick Query Cards */}
      <motion.div
        className="grid grid-cols-2 sm:grid-cols-4 gap-3"
        variants={stagger}
      >
        {QUICK_QUERIES.map((q) => (
          <motion.button
            key={q.label}
            variants={fadeUp}
            onClick={() => {
              setQuery(q.sql);
              setResult(null);
              setError(null);
            }}
            className="group flex flex-col items-center gap-2 rounded-xl border border-border/60 bg-card/50 p-4 text-center transition-all hover:border-primary/30 hover:bg-primary/5 cursor-pointer card-3d-swing"
          >
            <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
              <q.icon className="w-4 h-4 text-primary" />
            </div>
            <span className="text-xs font-medium text-muted-foreground group-hover:text-foreground transition-colors">
              {q.label}
            </span>
          </motion.button>
        ))}
      </motion.div>

      {/* Database Schema Reference */}
      <motion.div variants={fadeUp}>
        <button
          onClick={() => setSchemaOpen((v) => !v)}
          className="w-full flex items-center justify-between px-5 py-3.5 rounded-xl border border-border/60 bg-card/50 hover:border-primary/30 hover:bg-primary/5 transition-all group"
        >
          <div className="flex items-center gap-2.5">
            <Table2 className="w-5 h-5 text-primary" />
            <span className="text-sm font-semibold">Database Schema Reference</span>
            <Badge variant="outline" className="text-[10px] border-primary/30 text-primary ml-1">
              {DB_SCHEMA.length} tables
            </Badge>
          </div>
          <ChevronDown
            className={cn(
              "w-4 h-4 text-muted-foreground transition-transform duration-300",
              schemaOpen && "rotate-180"
            )}
          />
        </button>

        <AnimatePresence>
          {schemaOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: "easeOut" as const }}
              className="overflow-hidden"
            >
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 pt-4">
                {DB_SCHEMA.map((schema) => (
                  <Card
                    key={schema.table}
                    className={cn(
                      "bg-gradient-to-br border overflow-hidden card-3d-swing",
                      schema.bg,
                      schema.accent
                    )}
                  >
                    <CardHeader className="pb-2 pt-4 px-5">
                      <CardTitle className="flex items-center gap-2.5 text-sm font-semibold">
                        <schema.icon className={cn("w-4 h-4", schema.color)} />
                        <code className="font-mono text-foreground">{schema.table}</code>
                      </CardTitle>
                      <p className="text-xs text-muted-foreground mt-1">{schema.description}</p>
                    </CardHeader>
                    <CardContent className="px-5 pb-4 space-y-3">
                      {/* Columns */}
                      <div className="space-y-1">
                        {schema.columns.map((col) => (
                          <div
                            key={col.name}
                            className="flex items-center gap-2 text-xs font-mono py-1 border-b border-border/20 last:border-0"
                          >
                            <span className="w-4 flex-shrink-0">
                              {col.pk ? (
                                <Key className="w-3 h-3 text-amber-400" />
                              ) : col.fk ? (
                                <Link2 className="w-3 h-3 text-blue-400" />
                              ) : (
                                <span className="w-3 h-3 inline-block" />
                              )}
                            </span>
                            <span className="text-foreground/90 flex-1">{col.name}</span>
                            <Badge variant="outline" className="text-[10px] px-1.5 py-0 border-border/40 text-muted-foreground font-mono">
                              {col.type}
                            </Badge>
                            {col.note && (
                              <span className="text-[10px] text-muted-foreground/60 italic">{col.note}</span>
                            )}
                          </div>
                        ))}
                      </div>

                      {/* Relations */}
                      {schema.relations.length > 0 && (
                        <div className="pt-1.5 border-t border-border/30">
                          <p className="text-[10px] text-muted-foreground/60 uppercase tracking-wider mb-1">Relations</p>
                          {schema.relations.map((rel) => (
                            <p key={rel} className="text-[11px] font-mono text-primary/70">{rel}</p>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Query Editor */}
      <motion.div variants={fadeUp}>
        <Card className="bg-card/50 border-border/60">
          <CardContent className="pt-4 space-y-3">
            <Textarea
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              rows={5}
              placeholder="SELECT * FROM ..."
              className="font-mono text-sm bg-background border-border/60 placeholder:text-muted-foreground/40 resize-y"
            />
            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground/60">
                Ctrl+Enter to execute &middot; SELECT only
              </p>
              <Button
                onClick={handleExecute}
                disabled={loading || !query.trim()}
                size="sm"
                className="bg-primary hover:bg-primary/90 text-primary-foreground gap-1.5"
              >
                <Play className="w-3.5 h-3.5" />
                {loading ? "Running..." : "Execute"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Error */}
      {error && (
        <Card className="border-red-900/30 bg-card/50">
          <CardContent className="pt-4 flex items-center gap-2 text-sm text-red-300">
            <AlertTriangle className="w-4 h-4 flex-shrink-0" />
            <span className="font-mono text-xs break-all">{error}</span>
          </CardContent>
        </Card>
      )}

      {/* Results */}
      {result && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Card className="bg-card/50 border-border/60 overflow-hidden">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-foreground/80 flex items-center justify-between">
                <span>Results ({result.rows.length} rows)</span>
                <Badge
                  variant="outline"
                  className="border-border text-muted-foreground text-xs font-mono"
                >
                  <Clock className="w-3 h-3 mr-1" />
                  {result.execution_time_ms.toFixed(1)}ms
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {result.rows.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">
                  No rows returned
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-border/40 hover:bg-transparent">
                        {result.columns.map((col) => (
                          <TableHead
                            key={col}
                            className="text-muted-foreground text-xs font-mono font-medium"
                          >
                            {col}
                          </TableHead>
                        ))}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {result.rows.map((row, i) => (
                        <TableRow
                          key={i}
                          className="border-border/40 hover:bg-muted/30"
                        >
                          {result.columns.map((col) => (
                            <TableCell
                              key={col}
                              className="text-sm font-mono"
                            >
                              {String(row[col] ?? "NULL")}
                            </TableCell>
                          ))}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      )}
    </motion.div>
  );
}
