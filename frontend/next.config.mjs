/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  compress: true,
  swcMinify: true,
  experimental: {
    optimizePackageImports: [
      "lucide-react",
      "recharts",
      "framer-motion",
      "@tanstack/react-query",
      "react-icons"
    ],
  },
  images: {
    domains: ["images.unsplash.com", "lh3.googleusercontent.com", "avatars.githubusercontent.com"],
  },
  async rewrites() {
    return [
      {
        source: "/api/v1/:path*",
        destination: "http://localhost:8000/api/v1/:path*",
      },
    ];
  },
};

export default nextConfig;
