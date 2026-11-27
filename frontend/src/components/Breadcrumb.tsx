import Link from "next/link";

export type BreadcrumbItem = {
  label: string;
  href?: string;
};

interface BreadcrumbProps {
  items: BreadcrumbItem[];
}

export default function Breadcrumb({ items }: BreadcrumbProps) {
  const schemaItems = items.map((item, idx) => ({
    "@type": "ListItem",
    position: idx + 1,
    name: item.label,
    ...(item.href ? { item: `https://greenbrickz.com${item.href}` } : {}),
  }));

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: schemaItems,
          }),
        }}
      />
      <nav aria-label="Breadcrumb" className="max-w-7xl mx-auto px-4 py-3 flex flex-wrap items-center gap-2 text-sm">
        {items.map((item, idx) => (
          <div key={idx} className="flex items-center gap-2">
            {item.href ? (
              <Link href={item.href} className="text-[#16a34a] hover:underline font-medium">
                {item.label}
              </Link>
            ) : (
              <span aria-current="page" className="text-gray-700 font-medium">{item.label}</span>
            )}
            {idx < items.length - 1 && <span aria-hidden="true" className="text-gray-400">/</span>}
          </div>
        ))}
      </nav>
    </>
  );
}
