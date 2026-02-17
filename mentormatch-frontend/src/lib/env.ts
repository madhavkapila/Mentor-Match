import { z } from "zod";

const envSchema = z.object({
  NEXT_PUBLIC_TURNSTILE_SITE_KEY: z
    .string()
    .min(1, "Turnstile site key is required"),
  NEXT_PUBLIC_GOOGLE_CLIENT_ID: z
    .string()
    .min(1, "Google Client ID is required"),
});

function validateEnv() {
  const parsed = envSchema.safeParse({
    NEXT_PUBLIC_TURNSTILE_SITE_KEY: process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY,
    NEXT_PUBLIC_GOOGLE_CLIENT_ID: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
  });

  if (!parsed.success) {
    console.error(
      "❌ Invalid environment variables:",
      parsed.error.flatten().fieldErrors
    );
    // Don't throw in development to allow gradual setup
    if (process.env.NODE_ENV === "production") {
      throw new Error("Invalid environment variables");
    }
  }

  return {
    NEXT_PUBLIC_TURNSTILE_SITE_KEY:
      process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || "",
    NEXT_PUBLIC_GOOGLE_CLIENT_ID:
      process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "",
  };
}

export const env = validateEnv();
