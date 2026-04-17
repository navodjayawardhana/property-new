import type { NewsArticle } from "@/data/news";
import Link from "next/link";

export default function NewsCard({ article, large }: { article: NewsArticle; large?: boolean }) {
  return (
    <Link href={`/news`} className="group block">
      <div className="overflow-hidden rounded-lg">
        <img
          src={article.image}
          alt={article.title}
          className={`w-full object-cover group-hover:scale-105 transition duration-300 ${large ? "h-52" : "h-36"}`}
        />
      </div>
      <div className="mt-2">
        {article.tag && (
          <span className="text-xs font-bold text-[#121e80] uppercase tracking-wide">{article.tag}</span>
        )}
        <p className={`font-semibold text-gray-900 group-hover:text-[#121e80] transition-colors leading-snug mt-0.5 ${large ? "text-base" : "text-sm"}`}>
          {article.title}
        </p>
        <p className="text-xs text-gray-500 mt-1">{article.date}</p>
      </div>
    </Link>
  );
}
