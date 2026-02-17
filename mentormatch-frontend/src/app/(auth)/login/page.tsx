"use client";

import { Suspense, useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google";
import { useAuthStore } from "@/lib/auth";
import { AuthHydrator } from "@/hooks/use-auth";
import { env } from "@/lib/env";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { GraduationCap, Shield, Loader2 } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login, isLoading, isAuthenticated } = useAuthStore();
  const [error, setError] = useState<string | null>(null);

  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";

  useEffect(() => {
    if (isAuthenticated) {
      router.replace(callbackUrl);
    }
  }, [isAuthenticated, callbackUrl, router]);

  const handleGoogleSuccess = async (credentialResponse: { credential?: string }) => {
    if (!credentialResponse.credential) {
      setError("No credential received from Google");
      return;
    }

    try {
      setError(null);
      await login(credentialResponse.credential);
      toast.success("Welcome back!");
      router.push(callbackUrl);
    } catch {
      setError("Login failed. Your email may not be registered as an admin.");
      toast.error("Login failed");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number] }}
    >
      <Card className="w-full max-w-md border-border/60 bg-card/50 backdrop-blur-xl shadow-[0_0_60px_rgba(6,182,212,0.08)]">
        <CardHeader className="text-center pb-2">
          {/* Large animated logo */}
          <motion.div
            initial={{ scale: 0.5, opacity: 0, rotateY: -20 }}
            animate={{ scale: 1, opacity: 1, rotateY: 0 }}
            transition={{ delay: 0.15, type: "spring", stiffness: 150, damping: 15 }}
            className="flex items-center justify-center gap-2 mb-6"
          >
            <div className="relative">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-500/20 via-primary/10 to-blue-500/20 flex items-center justify-center border border-primary/20 shadow-[0_0_30px_rgba(6,182,212,0.15)]">
                <GraduationCap className="w-8 h-8 text-primary" />
              </div>
              <div className="absolute -inset-2 rounded-3xl border border-primary/10 animate-pulse-glow" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <CardTitle className="text-3xl font-bold tracking-tight">
              Mentor<span className="text-primary">Match</span>
            </CardTitle>
            <CardDescription className="flex items-center justify-center gap-2 mt-3 text-base">
              <Shield className="w-4 h-4" />
              Admin Portal
            </CardDescription>
          </motion.div>
        </CardHeader>

        <CardContent className="space-y-6 pt-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-10">
              <Loader2 className="w-7 h-7 animate-spin text-primary" />
              <span className="ml-3 text-muted-foreground">
                Authenticating...
              </span>
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.45 }}
              className="flex justify-center"
            >
              <GoogleOAuthProvider clientId={env.NEXT_PUBLIC_GOOGLE_CLIENT_ID}>
                <GoogleLogin
                  onSuccess={handleGoogleSuccess}
                  onError={() => {
                    setError("Google sign-in failed");
                    toast.error("Google sign-in failed");
                  }}
                  theme="filled_black"
                  size="large"
                  shape="pill"
                  text="signin_with"
                  width="300"
                />
              </GoogleOAuthProvider>
            </motion.div>
          )}

          {error && (
            <motion.p
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-sm text-destructive text-center"
            >
              {error}
            </motion.p>
          )}

          <div className="text-center pt-2">
            <Button variant="link" size="sm" asChild className="text-muted-foreground hover:text-foreground">
              <Link href="/">← Back to MentorMatch</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export default function LoginPage() {
  return (
    <AuthHydrator>
      <Suspense
        fallback={
          <div className="flex items-center justify-center">
            <Loader2 className="w-7 h-7 animate-spin text-primary" />
          </div>
        }
      >
        <LoginContent />
      </Suspense>
    </AuthHydrator>
  );
}
