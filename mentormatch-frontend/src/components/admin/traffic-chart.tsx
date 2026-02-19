"use client";

import { useEffect, useState } from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import { apiGet } from "@/lib/axios";
import type { TrafficHistoryResponse } from "@/types/admin";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

/** Format ISO hour string to a short label like "2pm" or "14:00" */
function formatHour(iso: string) {
  const d = new Date(iso + "Z"); // treat as UTC
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: false });
}

export function TrafficChart() {
  const [data, setData] = useState<TrafficHistoryResponse | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchHistory = async () => {
    try {
      const res = await apiGet<TrafficHistoryResponse>(
        "/api/v1/admin/traffic-history?hours=24"
      );
      setData(res);
    } catch {
      // Silently fail — chart just stays empty
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
    // Refresh every 60 seconds
    const interval = setInterval(fetchHistory, 60_000);
    return () => clearInterval(interval);
  }, []);

  if (loading && !data) {
    return <Skeleton className="h-80 rounded-xl" />;
  }

  if (!data || data.series.length === 0) {
    return null;
  }

  const chartData = data.series.map((p) => ({
    hour: formatHour(p.hour),
    "Chat Queries": p.chat_queries,
    "Visits": p.visits,
  }));

  return (
    <Card className="bg-card/50 border-border/60 hover:border-primary/20 transition-all">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold text-foreground/90 flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
            <Activity className="w-4 h-4 text-primary" />
          </div>
          Traffic (Last 24 Hours)
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-2">
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border) / 0.3)" />
            <XAxis
              dataKey="hour"
              tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
              interval="preserveStartEnd"
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              allowDecimals={false}
              tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
              tickLine={false}
              axisLine={false}
              width={32}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "8px",
                fontSize: "13px",
              }}
              labelStyle={{ color: "hsl(var(--foreground))" }}
            />
            <Legend
              wrapperStyle={{ fontSize: "12px", paddingTop: "8px" }}
            />
            <Line
              type="monotone"
              dataKey="Chat Queries"
              stroke="hsl(var(--primary))"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4 }}
            />
            <Line
              type="monotone"
              dataKey="Visits"
              stroke="#22d3ee"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
