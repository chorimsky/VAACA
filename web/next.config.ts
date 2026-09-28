import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Without this, Turbopack walks up past /Users/macsho/vaaca and picks up a
  // stray package-lock.json in the home directory as the workspace root.
  turbopack: { root: __dirname },
};

export default nextConfig;
