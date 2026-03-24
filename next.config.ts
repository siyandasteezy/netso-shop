import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  images: {
    localPatterns: [{ pathname: "/images/**" }, { pathname: "/logo*" }],
  },
  serverExternalPackages: ["@libsql/client"],
  turbopack: {
    root: path.resolve(__dirname),
  },
  async headers() {
    return [
      {
        // Allow the mobile app (and any client) to call all API routes
        source: "/api/:path*",
        headers: [
          { key: "Access-Control-Allow-Origin", value: "*" },
          { key: "Access-Control-Allow-Methods", value: "GET,POST,PUT,PATCH,DELETE,OPTIONS" },
          { key: "Access-Control-Allow-Headers", value: "Content-Type, Authorization" },
        ],
      },
    ];
  },
};

export default nextConfig;
