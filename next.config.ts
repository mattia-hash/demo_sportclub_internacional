import { loadEnvConfig } from "@next/env";
import type { NextConfig } from "next";

// Load .env before Next reads config (helps local dev pick up vars reliably).
loadEnvConfig(process.cwd());

const nextConfig: NextConfig = {
  /* config options here */
};

export default nextConfig;
