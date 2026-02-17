"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion } from "framer-motion";
import { apiPost } from "@/lib/axios";
import type { FeedbackCreate } from "@/types/chat";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { MessageSquare, Loader2, CheckCircle, Star, ArrowLeft, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { TurnstileWidget } from "@/components/shared/turnstile-widget";

const feedbackSchema = z.object({
  user_name: z.string().min(2, "Name must be at least 2 characters"),
  user_email: z.string().email("Enter a valid email address"),
  user_phone: z.string().optional(),
  message: z.string().min(10, "Feedback must be at least 10 characters"),
  rating: z.number().min(1).max(5),
});

type FeedbackForm = z.infer<typeof feedbackSchema>;

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);

  const form = useForm<FeedbackForm>({
    resolver: zodResolver(feedbackSchema),
    defaultValues: {
      user_name: "",
      user_email: "",
      user_phone: "",
      message: "",
      rating: 0,
    },
  });

  const selectedRating = form.watch("rating");

  const onSubmit = async (data: FeedbackForm) => {
    setIsSubmitting(true);
    try {
      const payload: FeedbackCreate & { turnstile_token?: string } = {
        ...data,
        ...(turnstileToken ? { turnstile_token: turnstileToken } : {}),
      };
      await apiPost("/api/v1/feedback", payload);
      setSubmitted(true);
      toast.success("Thank you for your feedback!");
    } catch (err: unknown) {
      const error = err as { detail?: string };
      toast.error(error.detail || "Failed to submit feedback");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="relative min-h-[70vh] flex items-center justify-center px-4">
        {/* Background orbs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden>
          <div className="orb orb-cyan w-[400px] h-[400px] top-0 right-0 animate-float-slow opacity-30" />
          <div className="orb orb-teal w-[300px] h-[300px] bottom-10 left-10 animate-float-reverse opacity-20" />
        </div>

        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 20 }}
          className="text-center relative z-10 max-w-md"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="w-20 h-20 rounded-3xl bg-emerald-500/10 flex items-center justify-center mx-auto mb-6 border border-emerald-500/20 shadow-[0_0_40px_rgba(16,185,129,0.15)]"
          >
            <CheckCircle className="w-10 h-10 text-emerald-500" />
          </motion.div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">Thank You!</h1>
          <p className="text-lg text-muted-foreground mt-3 leading-relaxed">
            Your feedback has been submitted successfully. We appreciate your input
            in making MentorMatch better.
          </p>
          <Button
            size="lg"
            className="mt-8 gap-2"
            onClick={() => setSubmitted(false)}
          >
            <ArrowLeft className="w-4 h-4" />
            Submit Another
          </Button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Background orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden>
        <div className="orb orb-cyan w-[500px] h-[500px] -top-40 -right-40 animate-float-slow opacity-25" />
        <div className="orb orb-blue w-[400px] h-[400px] bottom-20 -left-40 animate-float-reverse opacity-20" />
      </div>

      <div className="max-w-xl mx-auto px-4 py-16 sm:py-24 relative z-10">
        {/* Hero Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-10"
        >
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1, type: "spring", stiffness: 150, damping: 15 }}
            className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-500/20 via-primary/10 to-blue-500/20 flex items-center justify-center mx-auto mb-6 border border-primary/20 shadow-[0_0_30px_rgba(6,182,212,0.12)]"
          >
            <MessageSquare className="w-8 h-8 text-primary" />
          </motion.div>

          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-3">
            Share Your{" "}
            <span className="gradient-text">Feedback</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-md mx-auto leading-relaxed">
            Help us improve MentorMatch for the Thapar community
          </p>
        </motion.div>

        {/* Form Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card className="bg-card/50 border-border/60 hover:border-primary/20 transition-all shadow-[0_0_60px_rgba(6,182,212,0.04)] backdrop-blur-sm card-3d-flip">
            <CardContent className="pt-8 pb-6 px-6 sm:px-8">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                  <FormField
                    control={form.control}
                    name="user_name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium">Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Your name" className="h-11" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="user_email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium">Email</FormLabel>
                        <FormControl>
                          <Input
                            type="email"
                            placeholder="you@thapar.edu"
                            className="h-11"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="user_phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium">Phone (optional)</FormLabel>
                        <FormControl>
                          <Input
                            type="tel"
                            placeholder="+91 98765 43210"
                            className="h-11"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Star Rating */}
                  <FormField
                    control={form.control}
                    name="rating"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium">Rating</FormLabel>
                        <FormControl>
                          <div className="flex gap-1.5">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <motion.button
                                key={star}
                                type="button"
                                onClick={() => field.onChange(star)}
                                whileHover={{ scale: 1.2 }}
                                whileTap={{ scale: 0.9 }}
                                className="p-1 rounded-lg hover:bg-amber-500/10 transition-colors"
                              >
                                <Star
                                  className={`w-7 h-7 transition-colors ${
                                    star <= selectedRating
                                      ? "text-amber-500 fill-amber-500"
                                      : "text-muted-foreground/30"
                                  }`}
                                />
                              </motion.button>
                            ))}
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="message"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium">Your Feedback</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Tell us about your experience with MentorMatch..."
                            className="min-h-[120px]"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <TurnstileWidget onVerify={setTurnstileToken} />

                  <Button
                    type="submit"
                    disabled={isSubmitting || !turnstileToken}
                    size="lg"
                    className="w-full h-12 text-base font-medium gap-2"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" />
                        Submit Feedback
                      </>
                    )}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
