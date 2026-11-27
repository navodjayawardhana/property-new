import type { Metadata } from 'next';
import { cache } from 'react';
import { notFound } from 'next/navigation';
import AgentDetailClient from './AgentDetailClient';
import { type Agent, type AgentSlide, type PaginatedProperties } from '@/lib/api';
import { serverGet, ServerApiError } from '@/lib/server-api';

type Props = {
  params: Promise<{ id: string }>;
};

const SITE_URL = 'https://greenbrickz.com';

type AgentFetchResult = {
  agent: Agent | null;
  isNotFound: boolean;
};

// Deduped so generateMetadata and the page body share a single SSR fetch.
const getAgentResult = cache(async (id: string): Promise<AgentFetchResult> => {
  try {
    const agent = await serverGet<Agent>(`/agents/${encodeURIComponent(id)}`, {
      revalidate: 300,
      timeoutMs: 4000,
    });
    return { agent, isNotFound: false };
  } catch (err) {
    if (err instanceof ServerApiError && (err.status === 404 || err.status === 410)) {
      return { agent: null, isNotFound: true };
    }
    return { agent: null, isNotFound: false };
  }
});

function absoluteUrl(raw?: string | null): string {
  if (!raw) return `${SITE_URL}/GreenBricksLogo.png`;
  if (/^https?:\/\//i.test(raw)) return raw;
  return `${SITE_URL}${raw.startsWith('/') ? '' : '/'}${raw}`;
}

function buildAgentTitle(agent: Agent): string {
  const full = `${agent.name} - Real Estate Agent | Greenbricks`;
  if (full.length <= 65) return full;
  const shorter = `${agent.name} | Greenbricks Agent`;
  if (shorter.length <= 65) return shorter;
  const maxLen = 65 - ' | Greenbricks'.length - 1;
  return `${agent.name.slice(0, maxLen).trimEnd()}… | Greenbricks`;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const { agent, isNotFound } = await getAgentResult(id);

  if (!agent) {
    return {
      title: isNotFound ? 'Agent Not Found | Greenbricks' : 'Agent Profile | Greenbricks',
      description: 'View real estate agent profiles and property listings across Sri Lanka on Greenbricks.',
      ...(isNotFound ? { robots: { index: false, follow: false } } : {}),
    };
  }

  const title = buildAgentTitle(agent);
  const location = [agent.district || agent.suburb, agent.state].filter(Boolean).join(', ') || 'Sri Lanka';
  const bioSnippet = agent.bio ? ` ${agent.bio.replace(/\s+/g, ' ').trim()}` : '';
  const rawDescription = `Contact ${agent.name}, verified real estate agent in ${location}. View active properties and contact details on Greenbricks.${bioSnippet}`;
  const description = rawDescription.length <= 158 ? rawDescription : `${rawDescription.slice(0, 155).trimEnd()}...`;
  const image = absoluteUrl(agent.avatar);
  const url = `${SITE_URL}/agents/${encodeURIComponent(agent.slug || String(agent.id))}`;

  return {
    title,
    description,
    keywords: [agent.name, 'real estate agent Sri Lanka', agent.district || agent.suburb, 'property agent']
      .filter(Boolean)
      .join(', '),
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      type: 'profile',
      images: [{ url: image, width: 400, height: 400, alt: agent.name }],
    },
    twitter: {
      card: 'summary',
      title,
      description,
      images: [image],
    },
  };
}

function agentSchema(agent: Agent) {
  const url = `${SITE_URL}/agents/${encodeURIComponent(agent.slug || String(agent.id))}`;
  const socials = [agent.facebook, agent.instagram, agent.linkedin].filter(Boolean);
  const address: Record<string, string> = {
    '@type': 'PostalAddress',
    addressCountry: 'LK',
  };
  if (agent.suburb?.trim()) address.addressLocality = agent.suburb.trim();
  const region = (agent.district || agent.state)?.trim();
  if (region) {
    address.addressRegion = region;
  }
  if (agent.postcode?.trim()) address.postalCode = agent.postcode.trim();

  return {
    '@context': 'https://schema.org',
    '@type': 'RealEstateAgent',
    '@id': url,
    url,
    name: agent.name,
    ...(agent.bio ? { description: agent.bio } : {}),
    ...(agent.avatar ? { image: absoluteUrl(agent.avatar) } : {}),
    ...(agent.email ? { email: agent.email } : {}),
    ...(agent.phone ? { telephone: agent.phone } : {}),
    ...(socials.length > 0 ? { sameAs: socials } : {}),
    address,
    parentOrganization: {
      '@type': 'Organization',
      name: 'Greenbricks',
      url: SITE_URL,
    },
  };
}

export default async function Page({ params }: Props) {
  const { id } = await params;
  const { agent, isNotFound } = await getAgentResult(id);

  if (isNotFound) {
    notFound();
  }

  let initialSlides: AgentSlide[] = [];
  let initialProperties: PaginatedProperties | null = null;

  if (agent) {
    const userIds = (agent.user_ids ?? [agent.id]).join(',');
    const [slidesRes, propsRes] = await Promise.all([
      serverGet<AgentSlide[]>(`/agents/${encodeURIComponent(id)}/slides`, {
        revalidate: 300,
        timeoutMs: 3000,
      }).catch(() => [] as AgentSlide[]),
      serverGet<PaginatedProperties>(
        `/properties?user_ids=${encodeURIComponent(userIds)}&page=1&per_page=12`,
        { revalidate: 300, timeoutMs: 3000 }
      ).catch(() => null),
    ]);
    initialSlides = slidesRes;
    initialProperties = propsRes;
  }

  return (
    <>
      {agent && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(agentSchema(agent)) }}
        />
      )}
      <AgentDetailClient
        initialAgent={agent}
        initialSlides={initialSlides}
        initialProperties={initialProperties}
      />
    </>
  );
}
