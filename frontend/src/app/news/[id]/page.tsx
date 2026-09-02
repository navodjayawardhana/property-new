import type { Metadata } from "next";
import { cache } from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Breadcrumb from "@/components/Breadcrumb";
import NewsCard from "@/components/NewsCard";
import { newsApi, type NewsArticleApi } from "@/lib/api";

type Props = { params: Promise<{ id: string }> };

const getArticle = cache(async (id: string): Promise<NewsArticleApi | null> => {
  try {
    return await newsApi.get(Number(id));
  } catch {
    return null;
  }
});

const getRelated = cache(async (category: string): Promise<NewsArticleApi[]> => {
  try {
    const res = await newsApi.list({ category, per_page: 5 });
    return res.data;
  } catch {
    return [];
  }
});

function formatDate(dateStr: string | null) {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleDateString("en-LK", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const article = await getArticle(id);

  if (!article) {
    return {
      title: "Article Not Found | Greenbricks",
      description: "This property news article could not be found.",
      robots: "noindex, follow",
    };
  }

  const url = `https://greenbricks.net/news/${article.id}`;
  const description = article.excerpt?.slice(0, 160) || `${article.title} — property news and insights from Greenbricks.`;

  return {
    title: `${article.title} | Greenbricks Property News`,
    description,
    keywords: `${article.category}, ${article.tag ?? ""}, Sri Lanka property news, real estate insights`,
    alternates: { canonical: url },
    openGraph: {
      title: article.title,
      description,
      url,
      type: "article",
      publishedTime: article.published_at ?? article.created_at,
      modifiedTime: article.updated_at,
      section: article.category,
      images: [{ url: article.image_url, width: 1200, height: 630, alt: article.title }],
    },
    twitter: {
      card: "summary_large_image",
      title: article.title,
      description,
      images: [article.image_url],
    },
  };
}

function articleSchema(article: NewsArticleApi) {
  const url = `https://greenbricks.net/news/${article.id}`;
  return {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    "@id": url,
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
    headline: article.title,
    description: article.excerpt,
    image: [article.image_url],
    datePublished: article.published_at ?? article.created_at,
    dateModified: article.updated_at,
    articleSection: article.category,
    author: { "@type": "Organization", name: "Greenbricks", url: "https://greenbricks.net" },
    publisher: {
      "@type": "Organization",
      name: "Greenbricks",
      logo: { "@type": "ImageObject", url: "https://greenbricks.net/GreenBricksLogo.png" },
    },
  };
}

export default async function NewsArticlePage({ params }: Props) {
  const { id } = await params;
  const article = await getArticle(id);

  if (!article) notFound();

  const related = (await getRelated(article.category)).filter((a) => a.id !== article.id).slice(0, 4);

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema(article)) }}
      />
      <Navbar />

      <Breadcrumb
        items={[
          { label: "Home", href: "/" },
          { label: "Property News", href: "/news" },
          { label: article.title },
        ]}
      />

      <article className="max-w-3xl mx-auto px-4 pb-12 w-full flex-1">
        {article.tag && (
          <span className="text-xs font-bold text-[#16a34a] uppercase tracking-wider">
            {article.tag}
          </span>
        )}
        <h1 className="text-3xl sm:text-4xl font-black text-gray-900 leading-tight mt-2 mb-3">
          {article.title}
        </h1>
        <p className="text-sm text-gray-400 mb-6">
          {formatDate(article.published_at ?? article.created_at)}
          {article.read_time ? ` · ${article.read_time}` : ""}
          {article.category ? ` · ${article.category}` : ""}
        </p>

        {article.image_url && (
          <img
            src={article.image_url}
            alt={article.title}
            className="w-full rounded-2xl object-cover mb-8"
          />
        )}

        <div className="prose prose-lg max-w-none">
          <p className="text-lg text-gray-700 leading-relaxed">{article.excerpt}</p>
        </div>

        <div className="mt-10 pt-6 border-t border-gray-100">
          <Link href="/news" className="text-sm font-bold text-[#16a34a] hover:underline">
            ← Back to all property news
          </Link>
        </div>
      </article>

      {related.length > 0 && (
        <section className="border-t border-gray-100">
          <div className="max-w-7xl mx-auto px-4 py-10 w-full">
            <h2 className="text-xl font-bold text-gray-900 mb-6">More in {article.category}</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
              {related.map((a) => (
                <NewsCard key={a.id} article={a} />
              ))}
            </div>
          </div>
        </section>
      )}

      <Footer />
    </div>
  );
}
