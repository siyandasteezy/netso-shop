import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  images: {
    // Allow local images from /public
    localPatterns: [{ pathname: "/images/**" }, { pathname: "/logo*" }],
  },
  // libsql requires native bindings — exclude from Webpack/Turbopack bundling
  serverExternalPackages: ["@libsql/client"],
  turbopack: {
    // Fix: parent dir has a stray package-lock.json that confuses Turbopack's
    // workspace root detection, causing it to look for tailwindcss in the wrong place.
    root: path.resolve(__dirname),
  },
};

export default nextConfig;
