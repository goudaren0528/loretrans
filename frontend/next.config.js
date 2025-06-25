const withNextIntl = require('next-intl/plugin')(
  // This is the default directory structure provided by `next-intl`.
  './i18n.ts'
);

/** @type {import('next').NextConfig} */
const nextConfig = {
  // 环境变量配置 - 确保NLLB本地服务配置正确生效
  env: {
    USE_MOCK_TRANSLATION: 'false',
    NLLB_LOCAL_ENABLED: 'true',
    NLLB_LOCAL_URL: 'http://localhost:8081',
    NLLB_LOCAL_FALLBACK: 'true',
    NLLB_LOCAL_TIMEOUT: '30000',
  },
  images: {
    domains: ['cdn.transly.app'],
    formats: ['image/webp', 'image/avif'],
  },
  // SEO和性能优化
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
        ],
      },
      {
        source: '/api/(.*)',
        headers: [
          {
            key: 'Access-Control-Allow-Origin',
            value: '*',
          },
          {
            key: 'Access-Control-Allow-Methods',
            value: 'GET, POST, PUT, DELETE, OPTIONS',
          },
          {
            key: 'Access-Control-Allow-Headers',
            value: 'Content-Type, Authorization',
          },
        ],
      },
    ];
  },
  // 静态导出优化
  trailingSlash: false,
  // 压缩配置
  compress: true,

  // 重定向配置
  async redirects() {
    return [
      {
        source: '/translate',
        destination: '/',
        permanent: true,
      },
    ];
  },
  // 重写配置用于动态路由
  async rewrites() {
    return [
      {
        source: '/sitemap.xml',
        destination: '/api/sitemap',
      },
    ];
  },
};

module.exports = withNextIntl(nextConfig); 