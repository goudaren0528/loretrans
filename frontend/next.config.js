/** @type {import('next').NextConfig} */
const nextConfig = {
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

module.exports = nextConfig; 