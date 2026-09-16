import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    unoptimized: true,
  },
  async rewrites() {
    const backend = process.env.BACKEND_URL || "http://localhost:4000";
    return [
      { source: "/api/:path*", destination: `${backend}/api/:path*` },
      { source: "/uploads/:path*", destination: `${backend}/uploads/:path*` },
    ];
  },
  async redirects() {
    return [
      { source: "/all-men-glasses", destination: "/all-glasses/men", permanent: false },
      { source: "/all-women-glasses", destination: "/all-glasses/women", permanent: false },
    ];
  },
};

export default nextConfig;
