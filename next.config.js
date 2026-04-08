/** @type {import('next').NextConfig} */
const nextConfig = {
  // Allows images from any domain (for future Supabase Storage)
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '*.supabase.co' },
      { protocol: 'https', hostname: 'images.unsplash.com' },
    ],
  },
  },
};

module.exports = nextConfig;
