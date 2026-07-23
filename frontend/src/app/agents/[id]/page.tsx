import type { Metadata } from 'next';
import AgentDetailClient from './AgentDetailClient';
import { agentsApi } from '@/lib/api';

type Props = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  try {
    const { id } = await params;
    const agent = await agentsApi.get(id);

    const title = `${agent.name} - Real Estate Agent | Greenbricks`;
    const description = `Get in touch with ${agent.name}, a real estate agent${agent.suburb ? ` in ${agent.suburb}` : ''}, ${agent.state || 'Sri Lanka'}. View listings and contact details on Greenbricks.`;
    const image = agent.avatar || '/GreenBricksLogo.png';

    return {
      title,
      description,
      keywords: `${agent.name}, real estate agent, property agent, realtor`,
      openGraph: {
        title,
        description,
        url: `https://greenbricks.net/agents/${agent.slug || agent.id}`,
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
  } catch (error) {
    return {
      title: "Agent Profile | Greenbricks",
      description: "View agent profile on Greenbricks",
    };
  }
}

export default function Page() {
  return <AgentDetailClient />;
}
