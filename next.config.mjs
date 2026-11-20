/** @type {import('next').NextConfig} */
const nextConfig = {
  // Serve local high-res assets & external images directly without dev-mode Sharp proxy timeouts
  images: {
    unoptimized: true,
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: '*.supabase.co' },
      { protocol: 'https', hostname: 'instagram.com' },
      { protocol: 'https', hostname: '*.cdninstagram.com' },
    ],
  },
};

export default nextConfig;
