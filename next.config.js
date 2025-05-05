/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  // Always use ESM for Next.js, regardless of package.json settings
  experimental: {
    esmExternals: true,
  },
  // Handle PDF module on client-side only
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Don't resolve 'fs' module on the client
      config.resolve.fallback = {
        fs: false,
        path: false,
        crypto: false,
      };
    }
    
    return config;
  },
}

export default nextConfig; 