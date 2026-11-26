/** @type {import('next').NextConfig} */
export default {
  transpilePackages: ['@noor/prayer-engine', '@noor/islamic-core'],
  poweredByHeader: false,
  serverExternalPackages: ['@resvg/resvg-js'],
  outputFileTracingIncludes: { '/api/og/athar/[slug]': ['./src/assets/fonts/*'] },
};
