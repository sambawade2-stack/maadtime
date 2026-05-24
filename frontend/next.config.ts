import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  images: {
    remotePatterns: [
      {
        protocol: "http",
        hostname: "localhost",
        port: "8000",
        pathname: "/media/**",
      },
      {
        protocol: "https",
        hostname: "maadtime.com",
        pathname: "/media/**",
      },
      {
        protocol: "https",
        hostname: "www.maadtime.com",
        pathname: "/media/**",
      },
    ],
  },
};

export default nextConfig;
