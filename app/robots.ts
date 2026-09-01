import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/dashboard/', '/proposal/'],
      },
    ],
    sitemap: 'https://leadpilotsoftware.com/sitemap.xml',
  };
}
