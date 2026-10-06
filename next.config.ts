import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      }
    ],
  },
  async redirects() {
    return [
      {
        source: "/corporate",
        destination: "/shop/corporate",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
