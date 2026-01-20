import type { NextConfig } from "next";
import { setupDevPlatform } from "@cloudflare/next-on-pages/next-dev";

// Setup Cloudflare bindings for local development
if (process.env.NODE_ENV === "development") {
  setupDevPlatform();
}

const nextConfig: NextConfig = {
  output: "standalone",
  // Required for Cloudflare Pages
  experimental: {
    // Enable server actions for form handling
  },
};

export default nextConfig;
