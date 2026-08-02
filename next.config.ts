import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // `images.domains` is removed in Next 16 — remotePatterns is the only route.
    remotePatterns: [
      // Imagery carried over from the approved design-system mockup.
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
      // Property photography for the seeded listings.
      { protocol: "https", hostname: "images.unsplash.com" },
    ],
  },
};

export default nextConfig;
