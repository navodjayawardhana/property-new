export type NewsArticle = {
  id: string;
  title: string;
  excerpt: string;
  category: string;
  date: string;
  readTime: string;
  image: string;
  tag?: string;
};

export const newsArticles: NewsArticle[] = [
  {
    id: "1",
    title: "The LKR 30M church offering an unconventional path into the property market",
    excerpt: "A converted church in regional Victoria is giving first-home buyers a unique entry point into the market.",
    category: "Buying & Building",
    date: "Apr 16, 2026",
    readTime: "3 min read",
    image: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=600&q=80",
  },
  {
    id: "2",
    title: "RBA calls for 'rock solid' government support, says housing key for buying",
    excerpt: "The Reserve Bank has called on state and federal governments to accelerate housing supply reforms.",
    category: "Finance",
    date: "Apr 15, 2026",
    readTime: "4 min read",
    image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=600&q=80",
    tag: "INTEREST RATES",
  },
  {
    id: "3",
    title: "Sri Lanka's new horizon offers hope for buying back",
    excerpt: "New data shows first-home buyer activity is recovering in key markets across the eastern seaboard.",
    category: "News",
    date: "Apr 14, 2026",
    readTime: "5 min read",
    image: "https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=600&q=80",
  },
  {
    id: "4",
    title: "Rs 200k–Rs 20k a month: Fisherman's cottage selling tidy income se...",
    excerpt: "A quirky coastal fisherman's cottage is generating significant rental income for its current owners.",
    category: "Lifestyle",
    date: "Apr 13, 2026",
    readTime: "3 min read",
    image: "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=600&q=80",
  },
  {
    id: "5",
    title: "Seven suburbs: When a waterfront home ease...",
    excerpt: "We profile seven suburbs where waterfront living is becoming more accessible than you might think.",
    category: "Guides",
    date: "Apr 12, 2026",
    readTime: "6 min read",
    image: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=600&q=80",
  },
  {
    id: "6",
    title: "RBA says monetary policy 'can't solve everything'",
    excerpt: "The CBSL governor warned that interest rate cuts alone cannot fix Sri Lanka's housing affordability crisis.",
    category: "Finance",
    date: "Apr 11, 2026",
    readTime: "4 min read",
    image: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=600&q=80",
    tag: "NEWS",
  },
  {
    id: "7",
    title: "Why more SA buyers are ditching established homes",
    excerpt: "Sri Lankan buyers are increasingly turning to new builds as established home prices soar.",
    category: "Buying & Building",
    date: "Apr 10, 2026",
    readTime: "4 min read",
    image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=600&q=80",
    tag: "NEXT",
  },
  {
    id: "8",
    title: "You're single – and it's costing you thousands",
    excerpt: "Single buyers face a 35% premium compared to couples when purchasing a home, new research reveals.",
    category: "Finance",
    date: "Apr 9, 2026",
    readTime: "3 min read",
    image: "https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=600&q=80",
  },
  {
    id: "9",
    title: "New country home in Aus: how one buy up",
    excerpt: "A sea-change buyer shares how they upsized from a city apartment to a sprawling country estate.",
    category: "Lifestyle",
    date: "Apr 8, 2026",
    readTime: "5 min read",
    image: "https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=600&q=80",
  },
];

export const brokers = [
  { id: "1", name: "Jane Kwang", title: "Mortgage Broker", suburb: "Based in Sydney", avatar: "JK", image: "https://randomuser.me/api/portraits/women/44.jpg" },
  { id: "2", name: "Sam Ghomeyshi", title: "Mortgage Broker", suburb: "Based in Sydney", avatar: "SG", image: "https://randomuser.me/api/portraits/men/32.jpg" },
  { id: "3", name: "Odette Shahrasani", title: "Mortgage Broker", suburb: "Based in Narraween", avatar: "OS", image: "https://randomuser.me/api/portraits/women/68.jpg" },
  { id: "4", name: "Ryan Pappas", title: "Mortgage Broker", suburb: "Based in Sydney", avatar: "RP", image: "https://randomuser.me/api/portraits/men/75.jpg" },
  { id: "5", name: "Tony Law", title: "Mortgage Broker", suburb: "Based in Sydney", avatar: "TL", image: "https://randomuser.me/api/portraits/men/12.jpg" },
  { id: "6", name: "Priya Mehta", title: "Mortgage Broker", suburb: "Based in Melbourne", avatar: "PM", image: "https://randomuser.me/api/portraits/women/26.jpg" },
  { id: "7", name: "Chris Nguyen", title: "Mortgage Broker", suburb: "Based in Brisbane", avatar: "CN", image: "https://randomuser.me/api/portraits/men/58.jpg" },
];
