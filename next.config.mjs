// next.config.mjs — Next.js тохиргоо
// Express (port 4000) руу /api/* болон /uploads/* хүсэлтийг proxy хийнэ

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactCompiler: true,
  async rewrites() {
    return [
      // API хүсэлт → Express
      { source: '/api/:path*',      destination: 'http://localhost:4000/api/:path*' },
      // Upload зургууд → Express static
      { source: '/uploads/:path*',  destination: 'http://localhost:4000/uploads/:path*' },
    ];
  },
  images: {
    // dev дээр зурааг оновчлохгүй байлгана — /uploads/... харьцангуй зам
    // Next.js rewrite-ээр localhost:4000 руу дамжуулна (private IP алдаагүй)
    unoptimized: process.env.NODE_ENV !== "production",
    remotePatterns: [
      { protocol: 'https', hostname: '**.amazonaws.com' },
      { protocol: 'https', hostname: 'res.cloudinary.com' },
      { protocol: 'https', hostname: '**.neon.tech' },
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'plus.unsplash.com' },
      // localhost:4000-оос ирэх зургийг зөвшөөрнө
      { protocol: 'http', hostname: 'localhost', port: '4000' },
    ],
  },
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
};

export default nextConfig;
