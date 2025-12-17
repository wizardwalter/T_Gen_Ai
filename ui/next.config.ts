import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Emit a static export suitable for S3/CloudFront.
  output: "export",
  images: { unoptimized: true },
  trailingSlash: true,
};

export default nextConfig;
