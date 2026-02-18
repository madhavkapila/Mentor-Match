"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { apiGet } from "@/lib/axios";
import type { SuperAdminDashboard } from "@/types/admin";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Activity,
  Shield,
  Cpu,
  Star,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  Zap,
  MessageSquare,
  HardDrive,
  Network,
  Gauge,
} from "lucide-react";
import { cn } from "@/lib/utils";

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" as const } },
};

export default function DashboardOverviewPage() {
  const [data, setData] = useState<SuperAdminDashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await apiGet<SuperAdminDashboard>("/api/v1/admin/dashboard");
      setData(res);
    } catch (err: unknown) {
      const e = err as { detail?: string };
      setError(e?.detail || "Failed to load dashboard");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
    const interval = setInterval(fetchDashboard, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading && !data) {
    return <DashboardSkeleton />;
  }

  if (error && !data) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Card className="max-w-md w-full border-red-900/30 bg-card/50">
          <CardContent className="pt-6 text-center space-y-3">
            <AlertTriangle className="w-10 h-10 text-red-400 mx-auto" />
            <p className="text-sm text-red-300">{error}</p>
            <button
              onClick={fetchDashboard}
              className="text-xs text-muted-foreground hover:text-foreground underline"
            >
              Retry
            </button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!data) return null;

  const formatUptime = (seconds: number) => {
    const d = Math.floor(seconds / 86400);
    const h = Math.floor((seconds % 86400) / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    if (d > 0) return `${d}d ${h}h`;
    if (h > 0) return `${h}h ${m}m`;
    return `${m}m`;
  };

  const formatBytes = (bytes: number) => {
    if (bytes >= 1073741824) return `${(bytes / 1073741824).toFixed(1)} GB`;
    if (bytes >= 1048576) return `${(bytes / 1048576).toFixed(1)} MB`;
    if (bytes >= 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${bytes} B`;
  };

  return (
    <motion.div
      className="space-y-8"
      initial="hidden"
      animate="show"
      variants={stagger}
    >
      {/* Header */}
      <motion.div variants={fadeUp} className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-base text-muted-foreground mt-1.5">
            System overview &middot; Last updated{" "}
            {new Date(data.timestamp).toLocaleTimeString()}
          </p>
        </div>
        <Badge
          variant="outline"
          className={cn(
            "text-sm px-3 py-1.5",
            data.system.db_connection_status
              ? "border-emerald-700 text-emerald-400"
              : "border-red-700 text-red-400"
          )}
        >
          {data.system.db_connection_status ? "Systems Online" : "Degraded"}
        </Badge>
      </motion.div>

      {/* Traffic Row */}
      <motion.section variants={fadeUp}>
        <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-4">
          Traffic
        </h2>
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5"
          variants={stagger}
        >
          <StatCard
            icon={Activity}
            label="Total Requests"
            value={data.traffic.total_requests.toLocaleString()}
            index={0}
          />
          <StatCard
            icon={Zap}
            label="Active Sessions (24h)"
            value={data.traffic.active_sessions_24h.toLocaleString()}
            index={1}
          />
          <StatCard
            icon={Clock}
            label="Avg Latency"
            value={`${Math.round(data.traffic.average_latency_ms)}ms`}
            accent={data.traffic.average_latency_ms > 2000 ? "warn" : "default"}
            index={2}
          />
          <StatCard
            icon={Activity}
            label="Tokens Processed"
            value={data.traffic.total_tokens_processed.toLocaleString()}
            index={3}
          />
        </motion.div>
      </motion.section>

      {/* Security Row */}
      <motion.section variants={fadeUp}>
        <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-4">
          Security
        </h2>
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5"
          variants={stagger}
        >
          <StatCard
            icon={Shield}
            label="Total Blocks"
            value={data.security.total_blocks.toLocaleString()}
            accent={data.security.total_blocks > 0 ? "warn" : "default"}
            index={0}
          />
          <StatCard
            icon={AlertTriangle}
            label="Rate Limit Hits"
            value={data.security.rate_limit_hits.toLocaleString()}
            index={1}
          />
          <StatCard
            icon={Shield}
            label="Injection Attempts"
            value={data.security.prompt_injection_attempts.toLocaleString()}
            index={2}
          />
          <StatCard
            icon={Shield}
            label="SQLi Blocks"
            value={data.security.sqli_attempts.toLocaleString()}
            index={3}
          />
        </motion.div>
      </motion.section>

      {/* System & Business Row */}
      <motion.div variants={fadeUp} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* System Health */}
        <Card className="bg-card/50 border-border/60 hover:border-primary/20 transition-all">
          <CardHeader className="pb-4">
            <CardTitle className="text-base font-semibold text-foreground/90 flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <Cpu className="w-4 h-4 text-primary" />
              </div>
              System Health
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <ProgressBar label="CPU" value={data.system.cpu_usage_percent} />
            <ProgressBar label={`RAM (${data.system.ram_used_gb}/${data.system.ram_total_gb} GB)`} value={data.system.ram_usage_percent} />
            <ProgressBar
              label={`Disk (${data.system.storage.used_gb}/${data.system.storage.total_gb} GB)`}
              value={data.system.storage.used_percent}
              icon={<HardDrive className="w-3.5 h-3.5 text-muted-foreground" />}
            />
            <div className="flex items-center justify-between text-[15px]">
              <span className="text-muted-foreground">Database</span>
              <StatusBadge ok={data.system.db_connection_status} />
            </div>
            <div className="flex items-center justify-between text-[15px]">
              <span className="text-muted-foreground">ChatVat Engine</span>
              <StatusBadge ok={data.system.chatvat_engine_status} />
            </div>
            <div className="flex items-center justify-between text-[15px]">
              <span className="text-muted-foreground">Uptime</span>
              <span className="text-foreground font-mono text-sm">
                {formatUptime(data.system.uptime_seconds)}
              </span>
            </div>

            {/* Load Average */}
            <div className="flex items-center justify-between text-[15px]">
              <span className="text-muted-foreground flex items-center gap-1.5">
                <Gauge className="w-3.5 h-3.5" /> Load Avg
              </span>
              <span className="text-foreground font-mono text-sm">
                {data.system.load_average.map((v) => v.toFixed(2)).join(" / ")}
              </span>
            </div>

            {/* Network I/O */}
            <div className="flex items-center justify-between text-[15px]">
              <span className="text-muted-foreground flex items-center gap-1.5">
                <Network className="w-3.5 h-3.5" /> Network
              </span>
              <span className="text-foreground font-mono text-sm">
                ↑{formatBytes(data.system.network_bytes_sent)} ↓{formatBytes(data.system.network_bytes_recv)}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Business Metrics */}
        <Card className="bg-card/50 border-border/60 hover:border-primary/20 transition-all">
          <CardHeader className="pb-4">
            <CardTitle className="text-base font-semibold text-foreground/90 flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <Star className="w-4 h-4 text-primary" />
              </div>
              Business Metrics
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <MiniStat label="Total Feedback" value={data.business.total_feedback} />
              <MiniStat label="Avg Rating" value={data.business.avg_rating.toFixed(1)} />
              <MiniStat label="NPS" value={data.business.net_promoter_score.toFixed(0)} />
              <MiniStat label="Unresolved" value={data.business.unresolved_feedback} accent={data.business.unresolved_feedback > 0} />
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Top Processes */}
      {data.system.top_processes.length > 0 && (
        <motion.section variants={fadeUp}>
          <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-4">
            Top Processes (EC2 Host)
          </h2>
          <Card className="bg-card/50 border-border/60 hover:border-primary/20 transition-all">
            <CardContent className="pt-5">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-muted-foreground text-xs uppercase tracking-wider border-b border-border/40">
                      <th className="text-left pb-3 pl-2">PID</th>
                      <th className="text-left pb-3">Process</th>
                      <th className="text-right pb-3">CPU %</th>
                      <th className="text-right pb-3 pr-2">MEM %</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.system.top_processes.map((proc) => (
                      <tr
                        key={proc.pid}
                        className="border-b border-border/30 last:border-0 hover:bg-muted/30 transition-colors"
                      >
                        <td className="py-2.5 pl-2 font-mono text-muted-foreground">
                          {proc.pid}
                        </td>
                        <td className="py-2.5 font-medium truncate max-w-[200px]">
                          {proc.name}
                        </td>
                        <td className="py-2.5 text-right font-mono">
                          <span
                            className={cn(
                              proc.cpu_percent > 50
                                ? "text-red-400"
                                : proc.cpu_percent > 20
                                  ? "text-amber-400"
                                  : "text-foreground"
                            )}
                          >
                            {proc.cpu_percent.toFixed(1)}%
                          </span>
                        </td>
                        <td className="py-2.5 text-right font-mono pr-2">
                          <span
                            className={cn(
                              proc.memory_percent > 50
                                ? "text-red-400"
                                : proc.memory_percent > 20
                                  ? "text-amber-400"
                                  : "text-foreground"
                            )}
                          >
                            {proc.memory_percent.toFixed(1)}%
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </motion.section>
      )}

      {/* Recent Security Logs */}
      {data.recent_security_logs.length > 0 && (
        <motion.section variants={fadeUp}>
          <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-4">
            Recent Security Events
          </h2>
          <Card className="bg-card/50 border-border/60 hover:border-primary/20 transition-all">
            <CardContent className="pt-5">
              <div className="space-y-2.5">
                {data.recent_security_logs.map((log, i) => (
                  <div
                    key={i}
                    className="text-sm font-mono text-muted-foreground flex items-start gap-2.5 py-2 border-b border-border/40 last:border-0"
                  >
                    <MessageSquare className="w-3.5 h-3.5 mt-0.5 text-muted-foreground/50 flex-shrink-0" />
                    <span className="break-all">{log}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.section>
      )}
    </motion.div>
  );
}

/* ---- Sub-components ---- */

function StatCard({
  icon: Icon,
  label,
  value,
  accent = "default",
  index = 0,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  accent?: "default" | "warn";
  index?: number;
}) {
  return (
    <motion.div
      variants={fadeUp}
      whileHover={{ y: -3, transition: { duration: 0.2 } }}
    >
      <Card className="bg-card/50 border-border/60 hover:border-primary/30 transition-all duration-300 card-3d-press">
        <CardContent className="pt-6 pb-5 px-6">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Icon className="w-5 h-5 text-primary" />
            </div>
            {accent === "warn" && (
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
            )}
          </div>
          <p className="text-3xl font-bold tracking-tight">{value}</p>
          <p className="text-sm text-muted-foreground mt-1.5">{label}</p>
        </CardContent>
      </Card>
    </motion.div>
  );
}

function ProgressBar({ label, value, icon }: { label: string; value: number; icon?: React.ReactNode }) {
  const color =
    value > 90
      ? "bg-red-500"
      : value > 70
        ? "bg-amber-500"
        : "bg-emerald-500";
  const glowColor =
    value > 90
      ? "shadow-red-500/30"
      : value > 70
        ? "shadow-amber-500/30"
        : "shadow-emerald-500/30";
  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center text-[15px]">
        <span className="text-muted-foreground flex items-center gap-1.5">
          {icon}
          {label}
        </span>
        <span className="text-foreground font-mono text-sm">{value.toFixed(1)}%</span>
      </div>
      <div className="h-2 bg-muted rounded-full overflow-hidden">
        <motion.div
          className={cn("h-full rounded-full", color, `shadow-sm ${glowColor}`)}
          initial={{ width: 0 }}
          animate={{ width: `${Math.min(value, 100)}%` }}
          transition={{ duration: 0.8, ease: "easeOut" as const }}
        />
      </div>
    </div>
  );
}

function StatusBadge({ ok }: { ok: boolean }) {
  return ok ? (
    <span className="flex items-center gap-1.5 text-emerald-400 text-sm">
      <CheckCircle className="w-4 h-4" /> Connected
    </span>
  ) : (
    <span className="flex items-center gap-1.5 text-red-400 text-sm">
      <XCircle className="w-4 h-4" /> Down
    </span>
  );
}

function MiniStat({
  label,
  value,
  accent = false,
}: {
  label: string;
  value: string | number;
  accent?: boolean;
}) {
  return (
    <div className="bg-muted/50 rounded-xl p-4 hover:bg-muted/70 transition-colors">
      <p className="text-sm text-muted-foreground mb-1">{label}</p>
      <p
        className={cn(
          "text-2xl font-bold tracking-tight",
          accent ? "text-amber-400" : "text-foreground"
        )}
      >
        {value}
      </p>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-8">
      <div>
        <Skeleton className="h-9 w-48" />
        <Skeleton className="h-5 w-72 mt-2" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-36 rounded-xl" />
        ))}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-36 rounded-xl" />
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Skeleton className="h-64 rounded-xl" />
        <Skeleton className="h-64 rounded-xl" />
      </div>
    </div>
  );
}
