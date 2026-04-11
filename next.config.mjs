/** @type {import('next').NextConfig} */
const nextConfig = {
  // Allows images from any domain (for future Supabase Storage and Unsplash)
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: '*.supabase.co' },
      { protocol: 'https', hostname: 'instagram.com' },
      { protocol: 'https', hostname: '*.cdninstagram.com' },
    ],
  },
};

export default nextConfig;
