"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { apiGet, apiPost } from "@/lib/axios";
import type { FeedbackItem, FeedbackListResponse } from "@/types/admin";
import { RoleGuard } from "@/components/admin/role-guard";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  MessageSquare,
  CheckCircle,
  Clock,
  Star,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
} from "lucide-react";

const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" as const } },
};

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};

export default function FeedbackPage() {
  return (
    <RoleGuard minRole="editor">
      <FeedbackContent />
    </RoleGuard>
  );
}

function FeedbackContent() {
  const [items, setItems] = useState<FeedbackItem[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [filter, setFilter] = useState<"all" | "resolved" | "unresolved">("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [resolving, setResolving] = useState<number | null>(null);

  const pageSize = 15;

  const fetchFeedback = async () => {
    try {
      setLoading(true);
      setError(null);
      const params = new URLSearchParams({
        page: page.toString(),
        page_size: pageSize.toString(),
      });
      if (filter === "resolved") params.set("resolved", "true");
      if (filter === "unresolved") params.set("resolved", "false");

      const res = await apiGet<FeedbackListResponse>(
        `/api/v1/admin/feedback?${params.toString()}`
      );
      setItems(res.items);
      setTotal(res.total);
    } catch (err: unknown) {
      const e = err as { detail?: string };
      setError(e?.detail || "Failed to load feedback");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeedback();
  }, [page, filter]);

  const handleResolve = async (feedbackId: number) => {
    try {
      setResolving(feedbackId);
      await apiPost("/api/v1/admin/feedback/resolve", {
        feedback_id: feedbackId,
      });
      setItems((prev) =>
        prev.map((item) =>
          item.id === feedbackId ? { ...item, is_resolved: true } : item
        )
      );
    } catch (err: unknown) {
      const e = err as { detail?: string };
      alert(e?.detail || "Failed to resolve feedback");
    } finally {
      setResolving(null);
    }
  };

  const totalPages = Math.ceil(total / pageSize);

  return (
    <motion.div
      className="space-y-6"
      initial="hidden"
      animate="show"
      variants={stagger}
    >
      {/* Header */}
      <motion.div variants={fadeUp} className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight flex items-center gap-2">
            <MessageSquare className="w-6 h-6 text-primary" />
            Feedback
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {total} total &middot; Manage user feedback
          </p>
        </div>
      </motion.div>

      {/* Filter Tabs */}
      <motion.div variants={fadeUp} className="flex gap-2">
        {(["all", "unresolved", "resolved"] as const).map((f) => (
          <Button
            key={f}
            variant={filter === f ? "default" : "ghost"}
            size="sm"
            className={
              filter === f
                ? "bg-primary text-primary-foreground hover:bg-primary/90"
                : "text-muted-foreground hover:text-foreground"
            }
            onClick={() => {
              setFilter(f);
              setPage(1);
            }}
          >
            {f === "all" ? "All" : f === "resolved" ? "Resolved" : "Unresolved"}
          </Button>
        ))}
      </motion.div>

      {/* Error */}
      {error && (
        <Card className="border-red-900/30 bg-card/50">
          <CardContent className="pt-4 flex items-center gap-2 text-sm text-red-300">
            <AlertTriangle className="w-4 h-4" />
            {error}
          </CardContent>
        </Card>
      )}

      {/* Table */}
      <motion.div variants={fadeUp}>
        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-16 rounded-lg" />
            ))}
          </div>
        ) : items.length === 0 ? (
          <Card className="bg-card/50 border-border/60">
            <CardContent className="py-12 text-center text-muted-foreground">
              No feedback found.
            </CardContent>
          </Card>
        ) : (
          <Card className="bg-card/50 border-border/60 overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="border-border/40 hover:bg-transparent">
                  <TableHead className="text-muted-foreground text-xs font-medium">User</TableHead>
                  <TableHead className="text-muted-foreground text-xs font-medium">Message</TableHead>
                  <TableHead className="text-muted-foreground text-xs font-medium">Rating</TableHead>
                  <TableHead className="text-muted-foreground text-xs font-medium">Date</TableHead>
                  <TableHead className="text-muted-foreground text-xs font-medium">Status</TableHead>
                  <TableHead className="text-muted-foreground text-xs font-medium text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((item) => (
                  <TableRow key={item.id} className="border-border/40 hover:bg-muted/30">
                    <TableCell>
                      <div>
                        <p className="text-sm font-medium">{item.user_name}</p>
                        <p className="text-xs text-muted-foreground">{item.user_email}</p>
                      </div>
                    </TableCell>
                    <TableCell className="max-w-xs">
                      <p className="text-sm text-foreground/80 truncate">{item.message}</p>
                    </TableCell>
                    <TableCell>
                      {item.rating ? (
                        <span className="flex items-center gap-1 text-sm text-amber-400">
                          <Star className="w-3.5 h-3.5 fill-amber-400" />
                          {item.rating}
                        </span>
                      ) : (
                        <span className="text-xs text-muted-foreground/50">&mdash;</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <span className="text-xs text-muted-foreground">
                        {new Date(item.created_at).toLocaleDateString()}
                      </span>
                    </TableCell>
                    <TableCell>
                      {item.is_resolved ? (
                        <Badge className="bg-emerald-950/60 text-emerald-400 border-emerald-800/40 text-xs">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Resolved
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="border-amber-800/40 text-amber-400 text-xs">
                          <Clock className="w-3 h-3 mr-1" />
                          Open
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      {!item.is_resolved && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-xs text-muted-foreground hover:text-emerald-400"
                          disabled={resolving === item.id}
                          onClick={() => handleResolve(item.id)}
                        >
                          {resolving === item.id ? "..." : "Resolve"}
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        )}
      </motion.div>

      {/* Pagination */}
      {totalPages > 1 && (
        <motion.div variants={fadeUp} className="flex items-center justify-between">
          <p className="text-xs text-muted-foreground">
            Page {page} of {totalPages}
          </p>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
              className="text-muted-foreground"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="text-muted-foreground"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
