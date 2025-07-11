import type { NextConfig } from "next";
import dotenv from "dotenv";

// Load environment variables from `.env` file
dotenv.config();

const nextConfig: NextConfig = {
  reactStrictMode: false,
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
