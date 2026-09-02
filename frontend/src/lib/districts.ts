/**
 * The 25 administrative districts of Sri Lanka, used to build the
 * /buy/[district] and /rent/[district] landing pages that the footer links to.
 *
 * `name` must match how districts are stored in listing `suburb`/address data,
 * since the API filters with a LIKE match on `suburb`.
 */
export type District = {
  slug: string;
  name: string;
  province: string;
  /** Main towns and areas, used for on-page copy and internal linking. */
  areas: string[];
  /** One-line character of the district, used in meta descriptions and intro copy. */
  blurb: string;
};

export const DISTRICTS: District[] = [
  {
    slug: "colombo",
    name: "Colombo",
    province: "Western",
    areas: ["Colombo 3 – Kollupitiya", "Colombo 5 – Havelock Town", "Colombo 7 – Cinnamon Gardens", "Nugegoda", "Dehiwala", "Battaramulla"],
    blurb: "Sri Lanka's commercial capital and its most active property market, from high-rise apartments in Colombo 1–15 to family homes in the suburbs.",
  },
  {
    slug: "gampaha",
    name: "Gampaha",
    province: "Western",
    areas: ["Negombo", "Wattala", "Ja-Ela", "Kelaniya", "Kadawatha"],
    blurb: "A fast-growing Western Province district within commuting distance of Colombo, popular for land and new family homes.",
  },
  {
    slug: "kalutara",
    name: "Kalutara",
    province: "Western",
    areas: ["Panadura", "Horana", "Beruwala", "Bentota"],
    blurb: "Coastal Western Province district combining beachfront property around Bentota and Beruwala with affordable inland land.",
  },
  {
    slug: "kandy",
    name: "Kandy",
    province: "Central",
    areas: ["Peradeniya", "Katugastota", "Gampola", "Digana"],
    blurb: "The hill-country capital, with colonial-era houses, hillside land and a steady rental market driven by universities and tourism.",
  },
  {
    slug: "matale",
    name: "Matale",
    province: "Central",
    areas: ["Dambulla", "Sigiriya", "Ukuwela"],
    blurb: "Central Province district known for agricultural land, estate bungalows and tourism property near Sigiriya and Dambulla.",
  },
  {
    slug: "nuwara-eliya",
    name: "Nuwara Eliya",
    province: "Central",
    areas: ["Hatton", "Talawakele", "Ginigathena"],
    blurb: "Sri Lanka's hill station, where tea-estate bungalows and cool-climate holiday homes dominate the market.",
  },
  {
    slug: "galle",
    name: "Galle",
    province: "Southern",
    areas: ["Unawatuna", "Hikkaduwa", "Ahangama", "Galle Fort"],
    blurb: "The Southern Province's property hotspot, with Galle Fort villas, beachfront land and a strong holiday-rental market.",
  },
  {
    slug: "matara",
    name: "Matara",
    province: "Southern",
    areas: ["Mirissa", "Weligama", "Dikwella", "Deniyaya"],
    blurb: "Southern coastal district covering Mirissa and Weligama, popular for guesthouses, villas and beachfront land.",
  },
  {
    slug: "hambantota",
    name: "Hambantota",
    province: "Southern",
    areas: ["Tangalle", "Tissamaharama", "Ambalantota"],
    blurb: "Southern district with large land parcels, port-driven development and quieter beach property around Tangalle.",
  },
  {
    slug: "jaffna",
    name: "Jaffna",
    province: "Northern",
    areas: ["Nallur", "Chavakachcheri", "Point Pedro"],
    blurb: "The Northern Province capital, with a rebuilding housing market and strong demand for family homes and land.",
  },
  {
    slug: "kilinochchi",
    name: "Kilinochchi",
    province: "Northern",
    areas: ["Paranthan", "Poonakary"],
    blurb: "Northern district where agricultural land and affordable residential plots make up most of the market.",
  },
  {
    slug: "mannar",
    name: "Mannar",
    province: "Northern",
    areas: ["Mannar Town", "Nanattan"],
    blurb: "Coastal Northern district with low-priced land and a small but growing residential market.",
  },
  {
    slug: "mullaitivu",
    name: "Mullaitivu",
    province: "Northern",
    areas: ["Mullaitivu Town", "Oddusuddan"],
    blurb: "Northern coastal district offering some of the island's most affordable land and coastal plots.",
  },
  {
    slug: "vavuniya",
    name: "Vavuniya",
    province: "Northern",
    areas: ["Vavuniya Town", "Nedunkeni"],
    blurb: "A Northern transit hub with steady demand for town housing and commercial premises.",
  },
  {
    slug: "trincomalee",
    name: "Trincomalee",
    province: "Eastern",
    areas: ["Nilaveli", "Uppuveli", "Kinniya"],
    blurb: "Eastern Province district with natural-harbour frontage and beachfront land at Nilaveli and Uppuveli.",
  },
  {
    slug: "batticaloa",
    name: "Batticaloa",
    province: "Eastern",
    areas: ["Kattankudy", "Eravur", "Kalkudah"],
    blurb: "Eastern lagoon district with coastal land, guesthouses and a growing residential market.",
  },
  {
    slug: "ampara",
    name: "Ampara",
    province: "Eastern",
    areas: ["Arugam Bay", "Kalmunai", "Akkaraipattu"],
    blurb: "Eastern district covering Arugam Bay, where surf tourism drives demand for guesthouses and beach land.",
  },
  {
    slug: "kurunegala",
    name: "Kurunegala",
    province: "North Western",
    areas: ["Kuliyapitiya", "Narammala", "Melsiripura"],
    blurb: "A major inland hub with strong demand for town houses, coconut land and commercial property.",
  },
  {
    slug: "puttalam",
    name: "Puttalam",
    province: "North Western",
    areas: ["Chilaw", "Wennappuwa", "Kalpitiya"],
    blurb: "North Western coastal district covering Kalpitiya and Chilaw, popular for beach land and resort development.",
  },
  {
    slug: "anuradhapura",
    name: "Anuradhapura",
    province: "North Central",
    areas: ["Kekirawa", "Mihintale", "Medawachchiya"],
    blurb: "North Central district with agricultural land, town housing and tourism property near the ancient city.",
  },
  {
    slug: "polonnaruwa",
    name: "Polonnaruwa",
    province: "North Central",
    areas: ["Hingurakgoda", "Medirigiriya"],
    blurb: "North Central district dominated by paddy land and affordable residential plots.",
  },
  {
    slug: "badulla",
    name: "Badulla",
    province: "Uva",
    areas: ["Bandarawela", "Ella", "Haputale", "Welimada"],
    blurb: "Uva Province hill district covering Ella and Bandarawela, with mountain-view land and a strong holiday-rental market.",
  },
  {
    slug: "monaragala",
    name: "Monaragala",
    province: "Uva",
    areas: ["Wellawaya", "Bibile", "Buttala"],
    blurb: "Uva Province district with large, affordable land parcels and agricultural estates.",
  },
  {
    slug: "ratnapura",
    name: "Ratnapura",
    province: "Sabaragamuwa",
    areas: ["Balangoda", "Embilipitiya", "Pelmadulla"],
    blurb: "Sabaragamuwa's gem-country district, with estate land, town housing and riverside plots.",
  },
  {
    slug: "kegalle",
    name: "Kegalle",
    province: "Sabaragamuwa",
    areas: ["Mawanella", "Rambukkana", "Warakapola"],
    blurb: "Sabaragamuwa district on the Colombo–Kandy corridor, popular for land and family homes.",
  },
];

export const DISTRICT_SLUGS = DISTRICTS.map((d) => d.slug);

export function getDistrict(slug: string): District | undefined {
  return DISTRICTS.find((d) => d.slug === slug.toLowerCase());
}

/** Other districts in the same province — used for internal linking between landing pages. */
export function nearbyDistricts(district: District, limit = 4): District[] {
  return DISTRICTS.filter(
    (d) => d.province === district.province && d.slug !== district.slug,
  ).slice(0, limit);
}
