import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    optimizePackageImports: ["three", "@react-three/fiber", "@react-three/drei"],
  },
  compress: true,
  productionBrowserSourceMaps: false,
  poweredByHeader: false,
};

export default nextConfig;
