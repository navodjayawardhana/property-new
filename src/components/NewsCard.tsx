import type { NewsArticleApi } from "@/lib/api";
import Link from "next/link";

export default function NewsCard({ article, large }: { article: NewsArticleApi; large?: boolean }) {
  const date = article.published_at
    ? new Date(article.published_at).toLocaleDateString("en-AU", { day: "numeric", month: "short", year: "numeric" })
    : "";

  return (
    <Link href={`/news/${article.id}`} className="group block">
      <div className="overflow-hidden rounded-lg">
        <img
          src={article.image_url}
          alt={article.title}
          className={`w-full object-cover group-hover:scale-105 transition duration-300 ${large ? "h-52" : "h-36"}`}
        />
      </div>
      <div className="mt-2">
        {article.tag && (
          <span className="text-xs font-bold text-[#16a34a] uppercase tracking-wide">{article.tag}</span>
        )}
        <p className={`font-semibold text-gray-900 group-hover:text-[#16a34a] transition-colors leading-snug mt-0.5 ${large ? "text-base" : "text-sm"}`}>
          {article.title}
        </p>
        <p className="text-xs text-gray-500 mt-1">{date} · {article.read_time}</p>
      </div>
    </Link>
  );
}
