const createNextIntlPlugin = require('next-intl/plugin');

const withNextIntl = createNextIntlPlugin('./i18n/request.ts');

/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { isServer }) => {
    // Add polyfills for client-side
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        crypto: false,
      };
    }
    
    // Ensure regenerator-runtime is available
    config.resolve.alias = {
      ...config.resolve.alias,
      'regenerator-runtime': require.resolve('regenerator-runtime'),
    };
    
    return config;
  },
  // 环境变量配置 - 使用Hugging Face Space NLLB服务
  env: {
    // 生产环境使用Hugging Face Space，开发环境也可以使用
    USE_MOCK_TRANSLATION: process.env.USE_MOCK_TRANSLATION || 'false',
    
    // Hugging Face Space NLLB 1.3B 配置
    NLLB_SERVICE_ENABLED: 'true',
    NLLB_SERVICE_URL: process.env.NLLB_SERVICE_URL || 'https://wane0528-my-nllb-api.hf.space/api/v4/translator',
    NLLB_SERVICE_TIMEOUT: process.env.NLLB_SERVICE_TIMEOUT || '60000', // HF Space可能需要更长时间
    NLLB_SERVICE_FALLBACK: 'true',
    
    // 保留本地服务配置作为备用（已弃用）
    NLLB_LOCAL_ENABLED: 'false', // 不再使用本地服务
    NLLB_LOCAL_URL: 'http://localhost:8081', // 保留用于向后兼容
    
    // 为构建过程提供占位符
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co',
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-anon-key',
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder-service-key',
  },
  images: {
    domains: ['cdn.loretrans.app'],
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
      // Handle static assets that might be prefixed with locale
      {
        source: '/:locale/images/:path*',
        destination: '/images/:path*',
      },
      {
        source: '/:locale/icons/:path*',
        destination: '/icons/:path*',
      },
      {
        source: '/:locale/favicon.ico',
        destination: '/favicon.ico',
      },
      {
        source: '/:locale/manifest.json',
        destination: '/manifest.json',
      },
    ];
  },
};

module.exports = withNextIntl(nextConfig); 