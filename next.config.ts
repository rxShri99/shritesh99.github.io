import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    optimizePackageImports: ["three", "@react-three/fiber", "@react-three/drei"],
  },
  compress: true,
  productionBrowserSourceMaps: false,
  swcMinify: true,
  poweredByHeader: false,
};

export default nextConfig;
