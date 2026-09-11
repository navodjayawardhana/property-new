/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },

  compress: true,
  poweredByHeader: false,

  images: {
    // Serve modern formats to browsers that accept them — cuts listing/hero
    // image weight substantially versus the original JPEG/PNG.
    formats: ["image/avif", "image/webp"],
    // Keep optimised variants at the edge for 31 days instead of re-encoding.
    minimumCacheTTL: 2678400,
    remotePatterns: [
      { protocol: "https", hostname: "randomuser.me" },
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "api-property.adzone.space" },
      { protocol: "https", hostname: "api.greenbrickz.com" },
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
      // Local Laravel backend (php artisan serve)
      { protocol: "http", hostname: "localhost", port: "8000" },
      { protocol: "http", hostname: "127.0.0.1", port: "8000" },
    ],
  },

  async headers() {
    return [
      {
        // Static assets in /public are content-stable; cache them hard so a CDN
        // and repeat visitors stop re-fetching them.
        source: "/:file*.(png|jpg|jpeg|gif|svg|webp|avif|ico|woff|woff2|ttf)",
        headers: [
          { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
        ],
      },
      {
        source: "/robots.txt",
        headers: [{ key: "Cache-Control", value: "public, max-age=86400" }],
      },
      {
        source: "/sitemap.xml",
        headers: [
          { key: "Content-Type", value: "application/xml" },
          { key: "Cache-Control", value: "public, max-age=3600, s-maxage=3600" },
        ],
      },
      {
        // Baseline security headers — HSTS keeps the HTTPS signal the audit
        // credited from silently degrading on a stray http:// request.
        source: "/:path*",
        headers: [
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
