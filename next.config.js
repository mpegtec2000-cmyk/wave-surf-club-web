/** @type {import('next').NextConfig} */
const nextConfig = {
  // Allows images from any domain (for future Supabase Storage)
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '*.supabase.co' },
    ],
  },
  // Suppress specific warnings
  eslint: {
    ignoreDuringBuilds: false,
  },
};

module.exports = nextConfig;
