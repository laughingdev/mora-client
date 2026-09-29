import { MetadataRoute } from 'next';
import { getProductUrl } from '@/lib/urls';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

  let productUrls: any[] = [];
  let catUrls: any[] = [];
  let eventUrls: any[] = [];

  try {
    const resProducts = await fetch(`${apiBase}/products?limit=100`, { next: { revalidate: 3600 } });
    if (resProducts.ok) {
      const products = await resProducts.json();
      productUrls = (Array.isArray(products.data) ? products.data : []).map((p: any) => ({
        url: `${baseUrl}${getProductUrl(p)}`,
        lastModified: new Date(p.updatedAt || new Date()),
        changeFrequency: 'weekly',
        priority: 0.8,
      }));
    }
  } catch (e) {
    console.error("Sitemap: Failed to fetch products", e);
  }

  try {
    const resCats = await fetch(`${apiBase}/categories`, { next: { revalidate: 3600 } });
    if (resCats.ok) {
      const cats = await resCats.json();
      catUrls = (cats.data || []).map((c: any) => ({
        url: `${baseUrl}/shop/${c.slug}`,
        lastModified: new Date(c.updatedAt || new Date()),
        changeFrequency: 'weekly',
        priority: 0.8,
      }));
    }
  } catch (e) {
    console.error("Sitemap: Failed to fetch categories", e);
  }

  try {
    const resEvents = await fetch(`${apiBase}/events`, { next: { revalidate: 3600 } });
    if (resEvents.ok) {
      const events = await resEvents.json();
      eventUrls = (events.data || []).map((ev: any) => ({
        url: `${baseUrl}/events/${ev.slug}`,
        lastModified: new Date(ev.updatedAt || new Date()),
        changeFrequency: 'weekly',
        priority: 0.8,
      }));
    }
  } catch (e) {
    console.error("Sitemap: Failed to fetch events", e);
  }

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/shop`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/events`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/builder`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    ...eventUrls,
    ...catUrls,
    ...productUrls
  ];
}
