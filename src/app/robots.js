export default function robots() {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/dashboard', '/dashboard/*', '/api/*'],
    },
    sitemap: 'https://www.wavesurfclub.cl/sitemap.xml',
  };
}
