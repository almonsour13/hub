/** @type {import('next').NextConfig} */
const serverUrl = new URL(
    process.env.NEXT_PUBLIC_SERVER || "http://localhost:8000"
);

const nextConfig = {
    images: {
        remotePatterns: [
            {
                protocol: serverUrl.protocol.replace(":", ""), // "http" or "https"
                hostname: serverUrl.hostname, // "localhost" or "cdn.example.com"
                port: serverUrl.port || "", // "8000" if dev, empty in prod
                pathname: "/api/chat/**",
            },
        ],
    },
};

module.exports = nextConfig;
