"use client";
import { useParams } from "next/navigation";
import { getArticleBySlug, newsArticles } from "@/app/lib/data/news";
import { Calendar, Clock, ArrowLeft, Share2 } from "lucide-react";
import Link from "next/link";

export default function ArticlePage() {
  const params = useParams();
  const slug = params.slug as string;
  const article = getArticleBySlug(slug);
  const relatedArticles = newsArticles.filter((a) => a.slug !== slug).slice(0, 3);

  if (!article) {
    return (
      <main className="min-h-screen bg-gray-50 pt-24">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 text-center py-20">
          <h1 className="text-2xl font-bold text-gray-800">Article not found</h1>
          <Link href="/news" className="text-[#4CD137] font-semibold mt-4 inline-block">
            ← Back to news
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 pt-20">
      {/* Hero */}
      <section className="relative h-[400px] sm:h-[500px]">
        <img src={article.image} alt={article.title} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-8">
          <div className="max-w-4xl mx-auto">
            <Link
              href="/news"
              className="inline-flex items-center gap-1 text-white/70 text-sm mb-4 hover:text-white"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to News
            </Link>
            <span className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-[#4CD137] text-white mb-4">
              {article.category}
            </span>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white leading-tight mb-4">
              {article.title}
            </h1>
            <div className="flex flex-wrap items-center gap-4 text-white/70 text-sm">
              <div className="flex items-center gap-2">
                <img
                  src={article.author.image}
                  alt={article.author.name}
                  className="w-10 h-10 rounded-full object-cover border-2 border-white/20"
                />
                <span className="font-semibold text-white">{article.author.name}</span>
              </div>
              <span className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                {article.publishedAt}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                {article.readTime}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="max-w-4xl mx-auto px-5 sm:px-8 py-12">
        <div className="bg-white rounded-2xl p-6 sm:p-10 border border-gray-100">
          {/* Share buttons */}
          <div className="flex items-center gap-2 mb-8 pb-8 border-b border-gray-100">
            <span className="text-sm font-semibold text-gray-500 mr-2">Share:</span>
            <button className="w-9 h-9 rounded-full bg-blue-600 text-white flex items-center justify-center hover:opacity-90">
              <span className="text-xs font-bold">f</span>
            </button>
            <button className="w-9 h-9 rounded-full bg-sky-500 text-white flex items-center justify-center hover:opacity-90">
              <span className="text-xs font-bold">tw</span>
            </button>
            <button className="w-9 h-9 rounded-full bg-blue-700 text-white flex items-center justify-center hover:opacity-90">
              <span className="text-xs font-bold">in</span>
            </button>
            <button className="w-9 h-9 rounded-full bg-gray-200 text-gray-600 flex items-center justify-center hover:bg-gray-300">
              <Share2 className="w-4 h-4" />
            </button>
          </div>

          {/* Article Content */}
          <article
            className="prose prose-lg max-w-none prose-headings:font-bold prose-headings:text-gray-900 prose-p:text-gray-600 prose-a:text-[#4CD137]"
            dangerouslySetInnerHTML={{ __html: article.content }}
          />

          {/* Author Bio */}
          <div className="mt-10 pt-10 border-t border-gray-100">
            <div className="flex items-start gap-4">
              <img
                src={article.author.image}
                alt={article.author.name}
                className="w-16 h-16 rounded-xl object-cover"
              />
              <div>
                <h4 className="font-bold text-gray-900">Written by {article.author.name}</h4>
                <p className="text-sm text-gray-500 mt-1">
                  Expert real estate writer and property market analyst at GreenBrick.net
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Related Articles */}
      <section className="max-w-7xl mx-auto px-5 sm:px-8 pb-16">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Related Articles</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {relatedArticles.map((a) => (
            <Link
              key={a.id}
              href={`/news/${a.slug}`}
              className="group bg-white rounded-2xl overflow-hidden border border-gray-100 card-hover"
            >
              <div className="h-48 overflow-hidden">
                <img
                  src={a.image}
                  alt={a.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div className="p-5">
                <span className="inline-block px-2.5 py-1 rounded-full text-[10px] font-bold bg-green-50 text-[#4CD137] mb-3">
                  {a.category}
                </span>
                <h3 className="font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-[#4CD137] transition-colors">
                  {a.title}
                </h3>
                <span className="text-xs text-gray-400">{a.readTime}</span>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
