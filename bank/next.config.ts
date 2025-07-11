import type { NextConfig } from "next";
import dotenv from "dotenv";
dotenv.config();
const nextConfig: NextConfig = {
  reactStrictMode: false,
  output: "standalone",
  env: {
    NEXT_PUBLIC_ZENPAY_URL: process.env.NEXT_PUBLIC_ZENPAY_URL,
    BANK_WEBHOOK_URL_ZENPAY: process.env.BANK_WEBHOOK_URL_ZENPAY,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
