import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    root: __dirname,
  },
  allowedDevOrigins: ['127.0.0.1', 'localhost', '192.168.1.2'],
};

export default nextConfig;