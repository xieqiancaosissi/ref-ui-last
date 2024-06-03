/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ["@near-wallet-selector/wallet-connect"],
  experimental: {
    esmExternals: "loose",
  },
};

export default nextConfig;
