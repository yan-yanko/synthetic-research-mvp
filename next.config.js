/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  // Always use ESM for Next.js, regardless of package.json settings
  experimental: {
    esmExternals: 'loose', // More permissive ESM handling
  },
  env: {
    // Explicitly set environment variables as strings
    PDF_EXPORT_ENABLED: 'false',
  },
  // Handle browser-only modules on client-side only
  webpack: (config, { isServer }) => {
    // This ensures browser-only code isn't executed during SSR
    if (isServer) {
      // We don't need to alias html2pdf.js anymore since we're removing all static imports
      
      // Prevent any client-side only modules from being bundled
      const originalExternals = config.externals;
      config.externals = [
        ...(Array.isArray(originalExternals) ? originalExternals : [originalExternals]),
        {
          // Mark these modules as external
          canvas: 'canvas',
          jsdom: 'jsdom',
        },
      ];
    }

    if (!isServer) {
      // Don't resolve these modules on the client
      config.resolve.fallback = {
        fs: false,
        path: false,
        crypto: false,
        canvas: false,
        net: false,
        tls: false,
      };
    }
    
    return config;
  },
}

module.exports = nextConfig; 