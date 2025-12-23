/** @type {import('next').NextConfig} */
const nextConfig = {
  turbopack: {
    // ensure Turbopack resolves the correct workspace root to silence warnings
    root: __dirname,
  },
}

module.exports = nextConfig
