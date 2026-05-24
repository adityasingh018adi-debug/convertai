import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",          // generates /out — works for Cloudflare Pages & static hosts
  trailingSlash: true,       // /about → /about/index.html
  images: { unoptimized: true }, // required for static export
};

export default nextConfig;
