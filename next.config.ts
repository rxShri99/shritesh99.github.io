import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  experimental: {
    // NOTE: '@react-three/fiber' must NOT be listed here — the import rewrite
    // creates a second module instance, so @react-spring/three registers its
    // frame-loop effect on a fiber copy no Canvas drives (springs never move).
    optimizePackageImports: ['three', '@react-three/drei'],
  },
  compress: true,
  productionBrowserSourceMaps: false,
  poweredByHeader: false,
  webpack: (config) => {
    // Add rule for GLSL files
    config.module.rules.push({
      test: /\.(glsl|vs|fs|vert|frag)$/,
      exclude: /node_modules/,
      use: ['raw-loader', 'glslify-loader'],
    });
    return config;
  },
};

export default nextConfig;
