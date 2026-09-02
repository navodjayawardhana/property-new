/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    // Serve modern formats to browsers that accept them — cuts listing/hero
    // image weight substantially versus the original JPEG/PNG.
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      { protocol: "https", hostname: "randomuser.me" },
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "api-property.adzone.space" },
      { protocol: "https", hostname: "api.greenbricks.net" },
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
      // Local Laravel backend (php artisan serve)
      { protocol: "http", hostname: "localhost", port: "8000" },
      { protocol: "http", hostname: "127.0.0.1", port: "8000" },
    ],
  },
};

module.exports = nextConfig;
