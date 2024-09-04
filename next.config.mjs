/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
      domains: ["oaidalleapiprodscus.blob.core.windows.net"]
    },
    eslint: {
      ignoreDuringBuilds: true,
    },
    typescript: {
      ignoreBuildErrors: true,
    }
  }
  
  export default nextConfig;