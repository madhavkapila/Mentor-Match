"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { apiGet, apiPost } from "@/lib/axios";
import type { AdminUserItem, AdminUserListResponse } from "@/types/admin";
import { RoleGuard } from "@/components/admin/role-guard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Users,
  UserPlus,
  AlertTriangle,
  CheckCircle,
  ShieldOff,
  Shield,
} from "lucide-react";

const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" as const } },
};

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};

export default function UsersPage() {
  return (
    <RoleGuard minRole="admin">
      <UsersContent />
    </RoleGuard>
  );
}

function UsersContent() {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<string>("viewer");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  // User list state
  const [users, setUsers] = useState<AdminUserItem[]>([]);
  const [usersLoading, setUsersLoading] = useState(true);
  const [revoking, setRevoking] = useState<number | null>(null);

  const fetchUsers = async () => {
    try {
      setUsersLoading(true);
      const res = await apiGet<AdminUserListResponse>("/api/v1/admin/users/list");
      setUsers(res.users);
    } catch {
      // silently fail — the user table will just be empty
    } finally {
      setUsersLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    try {
      setLoading(true);
      setResult(null);
      await apiPost("/api/v1/admin/users/add", { email, role });
      setResult({
        type: "success",
        message: `Added ${email} as ${role}`,
      });
      setEmail("");
      setRole("viewer");
      fetchUsers(); // Refresh list
    } catch (err: unknown) {
      const e = err as { detail?: string };
      setResult({
        type: "error",
        message: e?.detail || "Failed to add user",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRevoke = async (userId: number) => {
    try {
      setRevoking(userId);
      await apiPost(`/api/v1/admin/users/${userId}/revoke`, {});
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, is_active: false } : u))
      );
    } catch (err: unknown) {
      const e = err as { detail?: string };
      alert(e?.detail || "Failed to revoke user");
    } finally {
      setRevoking(null);
    }
  };

  const roleColor = (r: string) => {
    switch (r) {
      case "super_admin":
        return "border-amber-700/40 text-amber-400";
      case "admin":
        return "border-primary/40 text-primary";
      case "editor":
        return "border-blue-700/40 text-blue-400";
      default:
        return "border-border text-muted-foreground";
    }
  };

  return (
    <motion.div
      className="space-y-8"
      initial="hidden"
      animate="show"
      variants={stagger}
    >
      {/* Header */}
      <motion.div variants={fadeUp}>
        <h1 className="text-2xl font-semibold tracking-tight flex items-center gap-2">
          <Users className="w-6 h-6 text-primary" />
          User Management
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Manage admin users and role-based access
        </p>
      </motion.div>

      {/* Add User Form */}
      <motion.div variants={fadeUp}>
        <Card className="bg-card/50 border-border/60 max-w-lg">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-foreground/80 flex items-center gap-2">
              <UserPlus className="w-4 h-4 text-primary" />
              Add Admin User
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAddUser} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-xs text-muted-foreground">
                  Email Address
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="user@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="bg-background border-border/60 placeholder:text-muted-foreground/40"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="role" className="text-xs text-muted-foreground">
                  Role
                </Label>
                <Select value={role} onValueChange={setRole}>
                  <SelectTrigger className="bg-background border-border/60">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="viewer">Viewer (read-only)</SelectItem>
                    <SelectItem value="editor">Editor (feedback)</SelectItem>
                    <SelectItem value="admin">Admin (user mgmt)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button
                type="submit"
                disabled={loading || !email.trim()}
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                {loading ? "Adding..." : "Add User"}
              </Button>
            </form>

            {result && (
              <div
                className={`mt-4 flex items-center gap-2 text-sm px-3 py-2 rounded-lg ${
                  result.type === "success"
                    ? "bg-emerald-950/40 text-emerald-400"
                    : "bg-red-950/40 text-red-400"
                }`}
              >
                {result.type === "success" ? (
                  <CheckCircle className="w-4 h-4 flex-shrink-0" />
                ) : (
                  <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                )}
                {result.message}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Users List */}
      <motion.div variants={fadeUp}>
        <h2 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">
          All Admin Users
        </h2>
        {usersLoading ? (
          <Card className="bg-card/50 border-border/60">
            <CardContent className="py-8 text-center text-muted-foreground text-sm">
              Loading users...
            </CardContent>
          </Card>
        ) : users.length === 0 ? (
          <Card className="bg-card/50 border-border/60">
            <CardContent className="py-8 text-center text-muted-foreground text-sm">
              No admin users found.
            </CardContent>
          </Card>
        ) : (
          <Card className="bg-card/50 border-border/60 overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="border-border/40 hover:bg-transparent">
                  <TableHead className="text-muted-foreground text-xs font-medium">User</TableHead>
                  <TableHead className="text-muted-foreground text-xs font-medium">Role</TableHead>
                  <TableHead className="text-muted-foreground text-xs font-medium">Status</TableHead>
                  <TableHead className="text-muted-foreground text-xs font-medium">Joined</TableHead>
                  <TableHead className="text-muted-foreground text-xs font-medium text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((u) => (
                  <TableRow key={u.id} className="border-border/40 hover:bg-muted/30">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="w-8 h-8">
                          <AvatarImage src={u.picture} />
                          <AvatarFallback className="bg-primary/10 text-primary text-xs">
                            {(u.name || u.email).charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          <p className="text-sm font-medium truncate">
                            {u.name || "—"}
                          </p>
                          <p className="text-xs text-muted-foreground truncate">
                            {u.email}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={`text-xs capitalize ${roleColor(u.role)}`}
                      >
                        {u.role.replace("_", " ")}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {u.is_active ? (
                        <Badge className="bg-emerald-950/60 text-emerald-400 border-emerald-800/40 text-xs">
                          <Shield className="w-3 h-3 mr-1" />
                          Active
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="border-red-800/40 text-red-400 text-xs">
                          <ShieldOff className="w-3 h-3 mr-1" />
                          Revoked
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <span className="text-xs text-muted-foreground">
                        {u.created_at
                          ? new Date(u.created_at).toLocaleDateString()
                          : "—"}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      {u.is_active && u.role !== "super_admin" && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-xs text-muted-foreground hover:text-red-400 hover:bg-red-950/20"
                          disabled={revoking === u.id}
                          onClick={() => handleRevoke(u.id)}
                        >
                          {revoking === u.id ? "..." : "Revoke"}
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

      {/* Role Info */}
      <motion.div variants={fadeUp}>
        <Card className="bg-card/50 border-border/60 max-w-lg">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-foreground/80">
              Role Hierarchy
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              {
                role: "Viewer",
                desc: "Read-only access to dashboard and analytics",
                level: 1,
              },
              {
                role: "Editor",
                desc: "Can view and resolve feedback items",
                level: 2,
              },
              {
                role: "Admin",
                desc: "Can manage users (add viewers, editors, admins)",
                level: 3,
              },
              {
                role: "Super Admin",
                desc: "Full access including SQL console (env-based)",
                level: 4,
              },
            ].map((r) => (
              <div
                key={r.role}
                className="flex items-center gap-3 px-3 py-2 rounded-lg bg-muted/30"
              >
                <span className="w-5 h-5 rounded-full bg-primary/15 text-primary text-xs font-bold flex items-center justify-center">
                  {r.level}
                </span>
                <div className="flex-1">
                  <p className="text-sm font-medium">{r.role}</p>
                  <p className="text-xs text-muted-foreground">{r.desc}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}
