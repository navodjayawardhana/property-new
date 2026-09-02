import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Breadcrumb from "@/components/Breadcrumb";
import PropertyCard from "@/components/PropertyCard";
import { properties as propertiesApi, type Property } from "@/lib/api";
import { type District, nearbyDistricts } from "@/lib/districts";

type Mode = "buy" | "rent";

const MODE_COPY = {
  buy: { label: "Buy", verb: "for sale", other: "rent" as Mode, otherLabel: "rent" },
  rent: { label: "Rent", verb: "for rent", other: "buy" as Mode, otherLabel: "buy" },
} as const;

const LKR = (n: number) =>
  `Rs ${Math.round(n).toLocaleString("en-LK")}`;

/**
 * Server-rendered district landing page. Listings are fetched here rather than
 * in a client effect so the property content is present in the HTML a crawler
 * receives — these pages are the site's main location-targeted entry points.
 */
export default async function DistrictLanding({
  district,
  mode,
}: {
  district: District;
  mode: Mode;
}) {
  const copy = MODE_COPY[mode];

  let listings: Property[] = [];
  let total = 0;
  try {
    const res = await propertiesApi.list({
      listing_type: mode,
      suburb: district.name,
      per_page: 24,
    });
    listings = res.data;
    total = res.total;
  } catch {
    // Landing page still renders its copy, links and schema if the API is down.
  }

  const prices = listings.map((p) => p.price).filter((n) => n > 0);
  const avgPrice = prices.length ? prices.reduce((a, b) => a + b, 0) / prices.length : null;
  const types = [...new Set(listings.map((p) => p.property_type).filter(Boolean))];
  const nearby = nearbyDistricts(district);

  const basePath = `/${mode}/${district.slug}`;
  const url = `https://greenbricks.net${basePath}`;

  const faqs = [
    {
      q: `How many properties are ${copy.verb} in ${district.name}?`,
      a: total > 0
        ? `Greenbricks currently lists ${total} propert${total === 1 ? "y" : "ies"} ${copy.verb} in ${district.name}, ${district.province} Province. Listings are updated as agents and owners publish them.`
        : `Greenbricks lists properties ${copy.verb} across ${district.name}, ${district.province} Province. New listings are added by agents and owners regularly — check back or set up a search to see the latest.`,
    },
    {
      q: `What types of property are available in ${district.name}?`,
      a: types.length > 0
        ? `Current ${district.name} listings include ${types.slice(0, 6).join(", ")}. You can filter by property type, price, bedrooms and bathrooms on this page.`
        : `${district.name} listings typically include houses, apartments, land and commercial premises. Use the filters to narrow by property type, price and bedrooms.`,
    },
    ...(avgPrice
      ? [{
          q: `What is the average price of property ${copy.verb} in ${district.name}?`,
          a: `Across the ${listings.length} ${district.name} listing${listings.length === 1 ? "" : "s"} currently shown on Greenbricks, the average asking price is ${LKR(avgPrice)}. Individual prices vary widely by area, land size and property condition.`,
        }]
      : []),
    {
      q: `Which areas of ${district.name} should I look at?`,
      a: `Popular areas in ${district.name} include ${district.areas.join(", ")}. ${district.blurb}`,
    },
  ];

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "@id": `${url}#faq`,
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };

  const collectionSchema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "@id": url,
    url,
    name: `Property ${copy.verb} in ${district.name}, Sri Lanka`,
    description: district.blurb,
    about: {
      "@type": "Place",
      name: `${district.name} District`,
      address: {
        "@type": "PostalAddress",
        addressRegion: `${district.province} Province`,
        addressCountry: "LK",
      },
    },
    ...(listings.length > 0
      ? {
          mainEntity: {
            "@type": "ItemList",
            numberOfItems: total,
            itemListElement: listings.slice(0, 10).map((p, i) => ({
              "@type": "ListItem",
              position: i + 1,
              url: `https://greenbricks.net/property/${p.id}`,
              name: p.title || p.address,
            })),
          },
        }
      : {}),
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      <Navbar />

      <Breadcrumb
        items={[
          { label: "Home", href: "/" },
          { label: copy.label, href: `/${mode}` },
          { label: district.name },
        ]}
      />

      <main className="max-w-7xl mx-auto px-4 pb-12 w-full flex-1">
        <header className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-black text-gray-900 leading-tight">
            Property {copy.verb} in {district.name}, Sri Lanka
          </h1>
          <p className="text-gray-600 mt-3 max-w-3xl leading-relaxed">
            {district.blurb} Browse {total > 0 ? `${total} ` : ""}listing
            {total === 1 ? "" : "s"} {copy.verb} across {district.name} District in the{" "}
            {district.province} Province, or refine your search by price, property type and
            bedrooms.
          </p>

          <div className="flex flex-wrap gap-2 mt-5">
            <Link
              href={`/${copy.other}/${district.slug}`}
              className="text-sm font-semibold border border-gray-300 hover:border-gray-500 text-gray-700 px-4 py-2 rounded-full transition-colors"
            >
              Property to {copy.otherLabel} in {district.name}
            </Link>
            <Link
              href={`/${mode}?suburb=${encodeURIComponent(district.name)}`}
              className="text-sm font-semibold bg-gray-900 hover:bg-gray-800 text-white px-4 py-2 rounded-full transition-colors"
            >
              Search with filters
            </Link>
          </div>
        </header>

        {/* Popular areas — internal links into filtered searches */}
        <section className="mb-10">
          <h2 className="text-lg font-bold text-gray-900 mb-3">
            Popular areas in {district.name}
          </h2>
          <div className="flex flex-wrap gap-2">
            {district.areas.map((area) => (
              <Link
                key={area}
                href={`/${mode}?suburb=${encodeURIComponent(area.split(" – ").pop() ?? area)}`}
                className="text-sm border border-gray-200 hover:border-[#16a34a] hover:text-[#16a34a] text-gray-600 px-3 py-1.5 rounded-full transition-colors"
              >
                {area}
              </Link>
            ))}
          </div>
        </section>

        {/* Listings — rendered on the server so they appear in the HTML */}
        <section className="mb-12">
          <h2 className="text-lg font-bold text-gray-900 mb-4">
            {total > 0
              ? `${total} propert${total === 1 ? "y" : "ies"} ${copy.verb} in ${district.name}`
              : `Properties ${copy.verb} in ${district.name}`}
          </h2>

          {listings.length === 0 ? (
            <div className="border border-gray-200 rounded-xl p-8 text-center">
              <p className="text-gray-600 font-medium">
                No {district.name} listings {copy.verb} right now.
              </p>
              <p className="text-gray-400 text-sm mt-1">
                Try a nearby district below, or browse everything {copy.verb} island-wide.
              </p>
              <Link
                href={`/${mode}`}
                className="inline-block mt-4 text-sm text-[#16a34a] font-semibold hover:underline"
              >
                Browse all properties {copy.verb}
              </Link>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {listings.map((p) => (
                  <PropertyCard key={p.id} property={p} />
                ))}
              </div>
              {total > listings.length && (
                <div className="mt-8 text-center">
                  <Link
                    href={`/${mode}?suburb=${encodeURIComponent(district.name)}`}
                    className="inline-block bg-gray-900 hover:bg-gray-800 text-white font-bold text-sm px-7 py-3 rounded-xl transition-colors"
                  >
                    See all {total} {district.name} listings
                  </Link>
                </div>
              )}
            </>
          )}
        </section>

        {/* FAQ — matches the FAQPage schema above */}
        <section className="mb-12 max-w-3xl">
          <h2 className="text-lg font-bold text-gray-900 mb-4">
            {district.name} property — frequently asked questions
          </h2>
          <div className="space-y-4">
            {faqs.map((f) => (
              <div key={f.q} className="border-b border-gray-100 pb-4">
                <h3 className="font-semibold text-gray-900 text-sm mb-1.5">{f.q}</h3>
                <p className="text-sm text-gray-600 leading-relaxed">{f.a}</p>
              </div>
            ))}
          </div>
        </section>

        {nearby.length > 0 && (
          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-3">
              Other districts in {district.province} Province
            </h2>
            <div className="flex flex-wrap gap-2">
              {nearby.map((d) => (
                <Link
                  key={d.slug}
                  href={`/${mode}/${d.slug}`}
                  className="text-sm border border-gray-200 hover:border-[#16a34a] hover:text-[#16a34a] text-gray-600 px-3 py-1.5 rounded-full transition-colors"
                >
                  Property {copy.verb} in {d.name}
                </Link>
              ))}
            </div>
          </section>
        )}
      </main>

      <Footer />
    </div>
  );
}
