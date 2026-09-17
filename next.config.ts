import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      // Allow the existing 5 MB image limit plus multipart/form fields.
      bodySizeLimit: "6mb",
    },
  },
};

export default nextConfig;
