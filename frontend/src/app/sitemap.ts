import type { MetadataRoute } from 'next';
import type { PaginatedAgents, PaginatedNews, PaginatedProperties } from '@/lib/api';
import { serverGet } from '@/lib/server-api';
import { DISTRICTS } from '@/lib/districts';

// Revalidated hourly so newly published listings and articles get discovered
// without blocking crawlers on slow upstream queries.
export const revalidate = 3600;

const BASE_URL = 'https://greenbrickz.com';
const MAX_SITEMAP_URLS = 45000;

function safeDate(raw?: string | null): Date | undefined {
  if (!raw) return undefined;
  const d = new Date(raw);
  return Number.isNaN(d.getTime()) ? undefined : d;
}

/** Detail pages for live public listings — main indexable property inventory. */
async function propertyEntries(): Promise<MetadataRoute.Sitemap> {
  try {
    const entries: MetadataRoute.Sitemap = [];
    let page = 1;
    let lastPage = 1;

    do {
      const res = await serverGet<PaginatedProperties>(
        `/properties?per_page=500&page=${page}`,
        { revalidate: 3600, timeoutMs: 3500 },
      );
      for (const p of res.data ?? []) {
        if (p.status === 'inactive') continue;
        entries.push({
          url: `${BASE_URL}/property/${p.id}`,
          lastModified: safeDate(p.updated_at ?? p.created_at),
          changeFrequency: 'weekly',
          priority: 0.7,
        });
      }
      lastPage = Math.min(res.last_page ?? 1, 20);
      page += 1;
    } while (page <= lastPage && entries.length < MAX_SITEMAP_URLS);

    return entries;
  } catch {
    return [];
  }
}

async function newsEntries(): Promise<MetadataRoute.Sitemap> {
  try {
    const res = await serverGet<PaginatedNews>(
      '/news?per_page=200',
      { revalidate: 3600, timeoutMs: 3000 },
    );
    return (res.data ?? [])
      .filter((a) => a.is_published !== false)
      .map((a) => ({
        url: `${BASE_URL}/news/${a.id}`,
        lastModified: safeDate(a.updated_at ?? a.published_at ?? a.created_at),
        changeFrequency: 'monthly' as const,
        priority: 0.6,
      }));
  } catch {
    return [];
  }
}

async function agentEntries(): Promise<MetadataRoute.Sitemap> {
  try {
    const entries: MetadataRoute.Sitemap = [];
    let page = 1;
    let lastPage = 1;
    do {
      const res = await serverGet<PaginatedAgents>(
        `/agents?per_page=100&page=${page}`,
        { revalidate: 3600, timeoutMs: 3000 },
      );
      for (const a of res.data ?? []) {
        entries.push({
          url: `${BASE_URL}/agents/${encodeURIComponent(String(a.slug ?? a.id))}`,
          changeFrequency: 'monthly',
          priority: 0.6,
        });
      }
      lastPage = Math.min(res.last_page ?? 1, 20);
      page += 1;
    } while (page <= lastPage);
    return entries;
  } catch {
    return [];
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPages: MetadataRoute.Sitemap = [
    { url: BASE_URL, changeFrequency: 'daily', priority: 1.0 },
    { url: `${BASE_URL}/buy`, changeFrequency: 'hourly', priority: 0.95 },
    { url: `${BASE_URL}/rent`, changeFrequency: 'hourly', priority: 0.95 },
    { url: `${BASE_URL}/sold`, changeFrequency: 'daily', priority: 0.8 },
    { url: `${BASE_URL}/new-homes`, changeFrequency: 'daily', priority: 0.85 },
    { url: `${BASE_URL}/commercial`, changeFrequency: 'daily', priority: 0.75 },
    { url: `${BASE_URL}/agents`, changeFrequency: 'daily', priority: 0.8 },
    { url: `${BASE_URL}/home-loans`, changeFrequency: 'weekly', priority: 0.7 },
    { url: `${BASE_URL}/tools/mortgage-calculator`, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${BASE_URL}/tools/property-valuation`, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${BASE_URL}/tools/suburb-profiles`, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${BASE_URL}/about`, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${BASE_URL}/contact`, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${BASE_URL}/news`, changeFrequency: 'weekly', priority: 0.7 },
    { url: `${BASE_URL}/sitemap-page`, changeFrequency: 'weekly', priority: 0.4 },
    { url: `${BASE_URL}/careers`, changeFrequency: 'monthly', priority: 0.4 },
    { url: `${BASE_URL}/privacy`, changeFrequency: 'yearly', priority: 0.3 },
    { url: `${BASE_URL}/terms`, changeFrequency: 'yearly', priority: 0.3 },
  ];

  // District landing pages — destinations linked from the footer and HTML sitemap.
  const districtPages: MetadataRoute.Sitemap = DISTRICTS.flatMap((d) => [
    {
      url: `${BASE_URL}/buy/${d.slug}`,
      changeFrequency: 'daily' as const,
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/rent/${d.slug}`,
      changeFrequency: 'daily' as const,
      priority: 0.85,
    },
  ]);

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
  ].slice(0, 50000);
}
