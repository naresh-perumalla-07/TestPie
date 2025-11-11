// import type { NextConfig } from "next";

// const nextConfig: NextConfig = {
//   /* config options here */
// };

// export default nextConfig;


import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // ✅ Disable ESLint blocking during production builds on Render
  eslint: {
    ignoreDuringBuilds: true,
  },
  // ✅ Optional but good: enable Turbopack experimental stability
  experimental: {
    turbo: {
      resolveAlias: {},
    },
  },
  // ✅ (Optional) Recommended for production
  reactStrictMode: true,
};

export default nextConfig;

