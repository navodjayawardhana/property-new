import type { Metadata } from 'next';
import { cache } from 'react';
import AgentDetailClient from './AgentDetailClient';
import { agentsApi, type Agent } from '@/lib/api';

type Props = {
  params: Promise<{ id: string }>;
};

// Deduped so generateMetadata and the page body share a single fetch.
const getAgent = cache(async (id: string): Promise<Agent | null> => {
  try {
    return await agentsApi.get(id);
  } catch {
    return null;
  }
});

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const agent = await getAgent(id);

  if (!agent) {
    return {
      title: "Agent Profile | Greenbricks",
      description: "View agent profile on Greenbricks",
    };
  }

  const title = `${agent.name} - Real Estate Agent | Greenbricks`;
  const description = `Get in touch with ${agent.name}, a real estate agent${agent.suburb ? ` in ${agent.suburb}` : ''}, ${agent.state || 'Sri Lanka'}. View listings and contact details on Greenbricks.`;
  const image = agent.avatar || '/GreenBricksLogo.png';
  const url = `https://greenbricks.net/agents/${agent.slug || agent.id}`;

  return {
    title,
    description,
    keywords: `${agent.name}, real estate agent, property agent, realtor`,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      type: "profile",
      images: [{ url: image, width: 400, height: 400, alt: agent.name }],
    },
    twitter: {
      card: "summary",
      title,
      description,
      images: [image],
    },
  };
}

function agentSchema(agent: Agent) {
  const url = `https://greenbricks.net/agents/${agent.slug || agent.id}`;
  const socials = [agent.facebook, agent.instagram, agent.linkedin].filter(Boolean);

  return {
    "@context": "https://schema.org",
    "@type": "RealEstateAgent",
    "@id": url,
    url,
    name: agent.name,
    ...(agent.bio ? { description: agent.bio } : {}),
    ...(agent.avatar ? { image: agent.avatar } : {}),
    ...(agent.email ? { email: agent.email } : {}),
    ...(agent.phone ? { telephone: agent.phone } : {}),
    ...(socials.length > 0 ? { sameAs: socials } : {}),
    address: {
      "@type": "PostalAddress",
      ...(agent.suburb ? { addressLocality: agent.suburb } : {}),
      ...(agent.state ? { addressRegion: agent.state } : {}),
      ...(agent.postcode ? { postalCode: agent.postcode } : {}),
      addressCountry: "LK",
    },
    parentOrganization: {
      "@type": "Organization",
      name: "Greenbricks",
      url: "https://greenbricks.net",
    },
  };
}

export default async function Page({ params }: Props) {
  const { id } = await params;
  const agent = await getAgent(id);

  return (
    <>
      {agent && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(agentSchema(agent)) }}
        />
      )}
      <AgentDetailClient />
    </>
  );
}
