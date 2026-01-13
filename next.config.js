/** @type {import('next').NextConfig} */
const nextConfig = {
  // Docker 部署支持
  output: 'standalone',

  // API 路由配置
  api: {
    bodyParser: {
      sizeLimit: '10mb', // 请求体大小限制
    },
    responseLimit: '10mb', // 响应体大小限制
  },

  // 实验性功能配置
  experimental: {
    serverActions: {
      allowedOrigins: ['localhost', 'newkit.site'],
      bodySizeLimit: '10mb'
    },
    optimizePackageImports: ['lucide-react', 'date-fns', 'lodash']
  },

  images: {
    domains: [
      'dash.cloudflare.com',
      'www.google.com',
      'ph-static.imgix.net',
      'app.leonardo.ai'
    ],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  async rewrites() {
    return [
      {
        source: '/api/auth/:path*',
        destination: '/api/auth/:path*'
      },
      {
        source: '/auth/:path*',
        destination: '/auth/:path*'
      }
    ]
  }
}

module.exports = nextConfig
