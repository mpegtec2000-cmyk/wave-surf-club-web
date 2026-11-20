export default async function sitemap() {
  const baseUrl = 'https://www.wavesurfclub.cl';

  const routes = [
    '',
    '/escuelas',
    '/tienda',
    '/taller',
    '/riders',
    '/equipo',
    '/eventos',
    '/contacto',
    '/spots',
    '/servicios',
    '/biografia',
    '/agenda',
  ];

  return routes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: route === '' || route === '/tienda' ? 'daily' : 'weekly',
    priority: route === '' ? 1.0 : route === '/tienda' || route === '/escuelas' ? 0.9 : 0.8,
  }));
}
