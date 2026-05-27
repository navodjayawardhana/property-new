import { newsArticles } from "@/app/lib/data/news";
import Link from "next/link";
import { Calendar, Clock, ArrowRight } from "lucide-react";

const categories = ["All", "Market News", "Buying Tips", "Selling Tips", "Investing", "Lifestyle"];

export default function NewsPage() {
  const featuredArticle = newsArticles[0];
  const otherArticles = newsArticles.slice(1);

  return (
    <main className="min-h-screen bg-gray-50 pt-20">
      {/* Hero */}
      <section className="bg-[#1a1a5e] py-12">
        <div className="max-w-7xl mx-auto px-5 sm:px-8">
          <h1 className="text-3xl sm:text-4xl font-black text-white mb-2">
            Property News & Insights
          </h1>
          <p className="text-white/60">
            Expert advice, market updates, and property tips
          </p>
        </div>
      </section>

      {/* Categories */}
      <section className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 py-4">
          <div className="flex flex-wrap gap-2">
            {categories.map((cat, idx) => (
              <button
                key={cat}
                className={`px-4 py-2 rounded-full text-sm font-bold transition-colors ${
                  idx === 0
                    ? "bg-[#4CD137] text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-[#4CD137] hover:text-white"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Article */}
      <section className="max-w-7xl mx-auto px-5 sm:px-8 py-10">
        <Link href={`/news/${featuredArticle.slug}`} className="block group">
          <div className="grid lg:grid-cols-2 gap-6 bg-white rounded-2xl overflow-hidden border border-gray-100 card-hover">
            <div className="h-64 lg:h-auto overflow-hidden">
              <img
                src={featuredArticle.image}
                alt={featuredArticle.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
            </div>
            <div className="p-6 lg:p-8 flex flex-col justify-center">
              <span className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-[#4CD137] text-white w-fit mb-4">
                {featuredArticle.category}
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-gray-900 mb-3 group-hover:text-[#4CD137] transition-colors">
                {featuredArticle.title}
              </h2>
              <p className="text-gray-500 mb-4 line-clamp-3">{featuredArticle.excerpt}</p>
              <div className="flex items-center gap-4 text-sm text-gray-400">
                <span className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  {featuredArticle.publishedAt}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {featuredArticle.readTime}
                </span>
              </div>
              <div className="flex items-center gap-3 mt-6">
                <img
                  src={featuredArticle.author.image}
                  alt={featuredArticle.author.name}
                  className="w-10 h-10 rounded-full object-cover"
                />
                <span className="text-sm font-semibold text-gray-700">{featuredArticle.author.name}</span>
              </div>
            </div>
          </div>
        </Link>
      </section>

      {/* Other Articles */}
      <section className="max-w-7xl mx-auto px-5 sm:px-8 pb-16">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Latest Articles</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {otherArticles.map((article) => (
            <Link
              key={article.id}
              href={`/news/${article.slug}`}
              className="group bg-white rounded-2xl overflow-hidden border border-gray-100 card-hover"
            >
              <div className="h-48 overflow-hidden">
                <img
                  src={article.image}
                  alt={article.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div className="p-5">
                <span className="inline-block px-2.5 py-1 rounded-full text-[10px] font-bold bg-green-50 text-[#4CD137] mb-3">
                  {article.category}
                </span>
                <h3 className="font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-[#4CD137] transition-colors">
                  {article.title}
                </h3>
                <p className="text-sm text-gray-500 line-clamp-2 mb-4">{article.excerpt}</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <img
                      src={article.author.image}
                      alt={article.author.name}
                      className="w-8 h-8 rounded-full object-cover"
                    />
                    <span className="text-xs font-semibold text-gray-600">{article.author.name}</span>
                  </div>
                  <span className="text-xs text-gray-400">{article.readTime}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        <div className="mt-10 text-center">
          <button className="px-8 py-3 rounded-xl border-2 border-[#4CD137] text-[#4CD137] text-sm font-bold hover:bg-[#4CD137] hover:text-white transition-all">
            Load More Articles
          </button>
        </div>
      </section>
    </main>
  );
}
