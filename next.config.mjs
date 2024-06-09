/** @type {import('next').NextConfig} */
import { BundleAnalyzerPlugin } from "webpack-bundle-analyzer";
const nextConfig = {
  reactStrictMode: true,
  output: "standalone",
  transpilePackages: ["@near-wallet-selector/wallet-connect"],
  experimental: {
    esmExternals: "loose",
  },
  // webpack: (config, { isServer }) => {
  //   if (!isServer) {
  //     config.plugins.push(
  //       new BundleAnalyzerPlugin({
  //         analyzerMode: "static",
  //         reportFilename: "./analyze/client.html",
  //         openAnalyzer: false,
  //       })
  //     );
  //   } else {
  //     config.plugins.push(
  //       new BundleAnalyzerPlugin({
  //         analyzerMode: "static",
  //         reportFilename: "./analyze/server.html",
  //         openAnalyzer: false,
  //       })
  //     );
  //   }
  //   return config;
  // },
};

export default nextConfig;
