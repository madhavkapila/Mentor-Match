import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,

  // Proxy API requests to the backend in development.
  // In production, Nginx handles this routing directly.
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: "http://localhost:8080/api/:path*",
      },
      {
        source: "/health",
        destination: "http://localhost:8080/health",
      },
    ];
  },
};

export default nextConfig;
