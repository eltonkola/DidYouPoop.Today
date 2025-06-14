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
    
    // Handle RevenueCat module loading
    config.resolve.alias = {
      ...config.resolve.alias,
      '@revenuecat/purchases-js': '@revenuecat/purchases-js',
    };
    
    return config;
  },
  // Add output configuration for static export compatibility
  output: 'standalone',
  // Disable SWC minification if causing issues
  swcMinify: false,
};

module.exports = nextConfig;