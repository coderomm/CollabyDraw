import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  env: {
    JWT_SECRET: process.env.JWT_SECRET,
    DATABASE_URL: process.env.DATABASE_URL,
  },

  publicRuntimeConfig: {
    JWT_SECRET: process.env.JWT_SECRET,
  },
};

export default nextConfig;
