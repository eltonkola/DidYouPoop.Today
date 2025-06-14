/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: { 
    unoptimized: true 
  },
  experimental: {
    esmExternals: false,
  },
  webpack: (config, { isServer }) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
    };
    
    // Fix for canvas-confetti in production builds
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        canvas: false,
      };
    }
    
    // Disable webpack caching to prevent EIO errors
    config.cache = false;
    
    // Ensure RevenueCat is treated as external for SSR
    if (isServer) {
      config.externals = config.externals || [];
      config.externals.push('@revenuecat/purchases-js');
    }
    
    return config;
  },
  // Add output configuration for static export compatibility
  output: 'standalone',
  // Disable SWC minification if causing issues
  swcMinify: false,
};

module.exports = nextConfig;