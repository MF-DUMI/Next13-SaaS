/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        domains: [
            "oaidalleapiprodscus.blob.core.windows.net"
        ]
    },
    eslint: {
        ignoreDuringBuilds: true,
    }

   }
export default nextConfig;
