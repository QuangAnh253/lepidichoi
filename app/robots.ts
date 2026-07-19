import { MetadataRoute } from 'next'
 
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: ['/guest', '/guest/ban-do'],
      disallow: ['/login', '/cai-dat', '/api/', '/_next/'],
    },
    sitemap: 'https://lepidichoi.io.vn/sitemap.xml',
  }
}
