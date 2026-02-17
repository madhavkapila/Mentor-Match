import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * THE "IRON WALL" — Server-side route protection for admin routes.
 * 
 * This middleware runs on the Edge BEFORE any page renders.
 * If a user tries to access /dashboard/* without a valid JWT → redirect to /login.
 * 
 * This is the ONLY secure way to protect routes in Next.js.
 * Client-side redirects (useEffect) are a secondary defense only.
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Only protect dashboard routes (admin area)
  if (pathname.startsWith("/dashboard")) {
    const token = request.cookies.get("mm_token")?.value;

    if (!token) {
      // No token → redirect to login
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }

    try {
      // Decode JWT payload (base64) to check expiry and role
      // We don't verify the signature here (that's the backend's job).
      // We only check that the token exists, is not expired, and has a subject.
      const payloadBase64 = token.split(".")[1];
      if (!payloadBase64) {
        throw new Error("Invalid token format");
      }

      const payload = JSON.parse(
        Buffer.from(payloadBase64, "base64").toString("utf-8")
      );

      // Check expiry
      const now = Math.floor(Date.now() / 1000);
      if (payload.exp && payload.exp < now) {
        // Token expired → clear cookie and redirect
        const loginUrl = new URL("/login", request.url);
        loginUrl.searchParams.set("callbackUrl", pathname);
        const response = NextResponse.redirect(loginUrl);
        response.cookies.delete("mm_token");
        return response;
      }

      // Check that there's a subject (email) in the token
      if (!payload.sub) {
        throw new Error("No subject in token");
      }

      // Token is valid (structurally) → allow through
      return NextResponse.next();
    } catch {
      // Any decode error → redirect to login
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      const response = NextResponse.redirect(loginUrl);
      response.cookies.delete("mm_token");
      return response;
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Protect all dashboard routes
    "/dashboard/:path*",
    // Skip static files, Next.js internals, and API routes
    // (these are handled by Next.js or the backend directly)
  ],
};
