import type { NextConfig } from "next";

const securityHeaders = [
  {
    key: 'X-DNS-Prefetch-Control',
    value: 'on'
  },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload' // Forces HTTPS for 2 years
  },
  {
    key: 'X-XSS-Protection',
    value: '1; mode=block' // Protects against Cross-Site Scripting (XSS) attacks
  },
  {
    key: 'X-Frame-Options',
    value: 'SAMEORIGIN' // Prevents Clickjacking
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff' // Prevents MIME-type sniffing
  },
  {
    key: 'Referrer-Policy',
    value: 'origin-when-cross-origin'
  }
];

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
