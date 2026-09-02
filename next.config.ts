import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Every image is now served from public/, so no remote host needs to be
    // allowed. Keeping this empty is the point: the optimiser can only reach
    // assets in this deployment, which removes a third party from the render
    // path and with it the rate-limit failures that produced blank listings.
    remotePatterns: [],
    // Next 16 defaults this to [75] and clamps any unlisted `quality` prop
    // to the nearest allowed value — without this, a gallery's quality={90}
    // silently becomes 75 sitewide.
    qualities: [75, 90, 100],
  },
};

export default nextConfig;
