"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { apiGet } from "@/lib/axios";
import type { SuperAdminDashboard } from "@/types/admin";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, BarChart3 } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

const COLORS = ["#06b6d4", "#ef4444", "#f59e0b", "#10b981", "#3b82f6"];

const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" as const } },
};

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1 } },
};

export default function AnalyticsPage() {
  const [data, setData] = useState<SuperAdminDashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await apiGet<SuperAdminDashboard>("/api/v1/admin/dashboard");
        setData(res);
      } catch (err: unknown) {
        const e = err as { detail?: string };
        setError(e?.detail || "Failed to load analytics");
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-32" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Skeleton className="h-80 rounded-xl" />
          <Skeleton className="h-80 rounded-xl" />
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <Card className="max-w-md w-full border-red-900/30 bg-card/50">
          <CardContent className="pt-6 text-center space-y-3">
            <AlertTriangle className="w-10 h-10 text-red-400 mx-auto" />
            <p className="text-sm text-red-300">{error || "No data"}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const securityData = [
    { name: "Rate Limit", value: data.security.rate_limit_hits },
    { name: "Prompt Injection", value: data.security.prompt_injection_attempts },
    { name: "SQLi", value: data.security.sqli_attempts },
    { name: "Banned Topics", value: data.security.banned_topic_hits },
  ];

  const systemData = [
    { name: "CPU", value: data.system.cpu_usage_percent },
    { name: "RAM", value: data.system.ram_usage_percent },
    { name: "Disk", value: data.system.storage.used_percent },
  ];

  const businessData = [
    { name: "Total Feedback", value: data.business.total_feedback },
    { name: "Avg Rating", value: data.business.avg_rating },
    { name: "NPS", value: data.business.net_promoter_score },
    { name: "Unresolved", value: data.business.unresolved_feedback },
  ];

  const tooltipStyle = {
    backgroundColor: "hsl(var(--card))",
    border: "1px solid hsl(var(--border))",
    borderRadius: "8px",
    color: "hsl(var(--foreground))",
    fontSize: "12px",
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
          <h1 className="text-2xl font-semibold tracking-tight flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-primary" />
            Analytics
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Visual breakdown of security and system metrics
          </p>
        </div>
        <Badge variant="outline" className="border-border text-muted-foreground text-xs">
          {new Date(data.timestamp).toLocaleString()}
        </Badge>
      </motion.div>

      {/* Charts */}
      <motion.div
        className="grid grid-cols-1 lg:grid-cols-2 gap-6"
        variants={stagger}
      >
        {/* Security Breakdown */}
        <motion.div variants={fadeUp}>
          <Card className="bg-card/50 border-border/60">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-foreground/80">
                Security Events Distribution
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={securityData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      dataKey="value"
                      paddingAngle={3}
                      stroke="none"
                    >
                      {securityData.map((_, idx) => (
                        <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={tooltipStyle} />
                    <Legend
                      wrapperStyle={{ fontSize: "12px", color: "hsl(var(--muted-foreground))" }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* System Resources */}
        <motion.div variants={fadeUp}>
          <Card className="bg-card/50 border-border/60">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-foreground/80">
                System Resource Usage
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={systemData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis
                      dataKey="name"
                      tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
                      axisLine={{ stroke: "hsl(var(--border))" }}
                    />
                    <YAxis
                      tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
                      axisLine={{ stroke: "hsl(var(--border))" }}
                      domain={[0, 100]}
                    />
                    <Tooltip
                      contentStyle={tooltipStyle}
                      formatter={(value) => [`${Number(value).toFixed(1)}%`]}
                    />
                    <Bar
                      dataKey="value"
                      fill="#06b6d4"
                      radius={[6, 6, 0, 0]}
                      maxBarSize={60}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Business Metrics Bar */}
        <motion.div variants={fadeUp} className="lg:col-span-2">
          <Card className="bg-card/50 border-border/60">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-foreground/80">
                Business Metrics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={businessData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis
                      dataKey="name"
                      tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
                      axisLine={{ stroke: "hsl(var(--border))" }}
                    />
                    <YAxis
                      tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
                      axisLine={{ stroke: "hsl(var(--border))" }}
                    />
                    <Tooltip contentStyle={tooltipStyle} />
                    <Bar
                      dataKey="value"
                      fill="#0891b2"
                      radius={[6, 6, 0, 0]}
                      maxBarSize={60}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
