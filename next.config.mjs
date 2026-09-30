/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  webpack: (config) => {
    // Matikan cache Webpack untuk mencegah heap error
    config.cache = false;
    return config;
  },
  // Ganti dari 'productionSourceMaps' ke yang valid
  productionBrowserSourceMaps: process.env.NODE_ENV === "development",
};

export default nextConfig;
