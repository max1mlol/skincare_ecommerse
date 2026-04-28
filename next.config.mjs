/** @type {import('next').NextConfig} */
// Next.js-ийн compile болон image тохиргоог нэг дор төвлөрүүлсэн файл.
const nextConfig = {
  /* config options here */
  reactCompiler: true,
  images: {
    // Одоогоор зөвхөн локал зураг ашиглаж байгаа тул remote source нээгээгүй байна.
    remotePatterns: [],
  },
};

export default nextConfig;
