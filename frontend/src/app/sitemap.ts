import { MetadataRoute } from 'next';
import { properties as propertiesApi, newsApi, agentsApi } from '@/lib/api';
import { DISTRICTS } from '@/lib/districts';

// Rebuilt hourly so newly published listings and articles get discovered.
export const revalidate = 3600;

const BASE_URL = 'https://greenbrickz.com';

/** Detail pages for every live listing — the main indexable content of the site. */
async function propertyEntries(): Promise<MetadataRoute.Sitemap> {
  try {
    const res = await propertiesApi.list({ per_page: 1000 });
    return res.data.map((p) => ({
      url: `${BASE_URL}/property/${p.id}`,
      lastModified: new Date(p.updated_at ?? p.created_at),
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    }));
  } catch {
    return [];
  }
}

async function newsEntries(): Promise<MetadataRoute.Sitemap> {
  try {
    const res = await newsApi.list({ per_page: 200 });
    return res.data.map((a) => ({
      url: `${BASE_URL}/news/${a.id}`,
      lastModified: new Date(a.updated_at ?? a.created_at),
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    }));
  } catch {
    return [];
  }
}

async function agentEntries(): Promise<MetadataRoute.Sitemap> {
  try {
    const res = await agentsApi.list({ per_page: 500 } as never);
    return res.data.map((a) => ({
      url: `${BASE_URL}/agents/${a.slug ?? a.id}`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    }));
  } catch {
    return [];
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = BASE_URL;

  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/buy`,
      lastModified: new Date(),
      changeFrequency: 'hourly',
      priority: 0.95,
    },
    {
      url: `${baseUrl}/rent`,
      lastModified: new Date(),
      changeFrequency: 'hourly',
      priority: 0.95,
    },
    {
      url: `${baseUrl}/sold`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/new-homes`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.85,
    },
    {
      url: `${baseUrl}/commercial`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.75,
    },
    {
      url: `${baseUrl}/agents`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/home-loans`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/tools/mortgage-calculator`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${baseUrl}/tools/property-valuation`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${baseUrl}/tools/suburb-profiles`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/news`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/sitemap-page`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.4,
    },
    {
      url: `${baseUrl}/careers`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.4,
    },
    {
      url: `${baseUrl}/privacy`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${baseUrl}/terms`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
  ];

  // District landing pages — the destinations the footer's location links point at.
  const districtPages: MetadataRoute.Sitemap = DISTRICTS.flatMap((d) => [
    {
      url: `${baseUrl}/buy/${d.slug}`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 0.9,
    },
    {
      url: `${baseUrl}/rent/${d.slug}`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 0.85,
    },
  ]);

  // A failing API must not break the sitemap — each helper degrades to [].
  const [propertyPages, newsPages, agentPages] = await Promise.all([
    propertyEntries(),
    newsEntries(),
    agentEntries(),
  ]);

  return [
    ...staticPages,
    ...districtPages,
    ...propertyPages,
    ...newsPages,
    ...agentPages,
  ];
}
