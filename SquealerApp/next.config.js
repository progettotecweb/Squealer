/**
 * @type {import('next').NextConfig}
 */

const nextConfig = {
    
    basePath: '/Home',
    // https://nextjs.org/docs/api-reference/next.config.js/headers
    distDir: "dist",
    images: {
        domains: ["127.0.0.1"],
   },
}

module.exports = nextConfig