import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/dashboard/', '/analytics/'], // Le decimos a Google que no intente indexar lo privado
    },
    sitemap: 'https://recur.es/sitemap.xml', // TU DOMINIO
  };
}