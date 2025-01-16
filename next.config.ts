import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    serverExternalPackages: [
        "winston", "winston-daily-rotate-file"
    ],
    eslint: {
        ignoreDuringBuilds: true
    }
};

export default nextConfig;
