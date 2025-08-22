import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 性能优化配置
  reactStrictMode: true,
  
  // 优化图片
  images: {
    formats: ['image/avif', 'image/webp'],
  },
  
  // 实验性功能，提升性能
  experimental: {
    // 优化CSS
    optimizeCss: true,
    // 优化包导入 - 简化路径
    optimizePackageImports: ['@/components'],
  },
  
  // 禁用遥测和追踪
  productionBrowserSourceMaps: false,
};

export default nextConfig;
