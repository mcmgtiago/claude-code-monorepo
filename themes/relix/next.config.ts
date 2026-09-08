import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typedRoutes: true,
  distDir: process.env.NODE_ENV === "development" ? ".next-dev" : ".next",
  experimental: {
    staleTimes: {
      dynamic: 0,
      static: 180
    }
  }
};

export default nextConfig;
