import type { NextConfig } from "next";
import bundleAnalyzer from "@next/bundle-analyzer";

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === "true",
});

const nextConfig: NextConfig = {
  output: "standalone",
  serverExternalPackages: ["@sparticuz/chromium"],
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "via.placeholder.com" },
      { protocol: "https", hostname: "daeng-map.s3.ap-northeast-2.amazonaws.com" },
      { protocol: "https", hostname: "placedog.net" },
      { protocol: "https", hostname: "s3.ap-northeast-2.amazonaws.com" },
    ],
  },
};

export default withBundleAnalyzer(nextConfig);