/** @type {import('next').NextConfig} */

function getCleanBackendUrl() {
  const FALLBACK = 'https://skillprax-backend.onrender.com';
  let url = process.env.NEXT_PUBLIC_API_URL || process.env.BACKEND_URL || FALLBACK;

  if (!url || typeof url !== 'string') {
    return FALLBACK;
  }

  // 1. If pasted as a markdown link: [text](https://example.com) -> extract https://example.com
  const mdMatch = url.match(/\((https?:\/\/[^\)]+)\)/i);
  if (mdMatch) {
    url = mdMatch[1];
  }

  // 2. Handle accidental "KEY=value" string ingestion
  if (url.includes('=')) {
    url = url.split('=').pop()?.trim() || '';
  }

  // 3. Strip whitespace and wrapper quotes/brackets
  url = url.trim().replace(/^["'\[]+|["'\]]+$/g, '').trim();

  // 4. Strip duplicate path parameters or API endpoints
  url = url
    .replace(/\/api\/:path\*?.*$/i, '')
    .replace(/\/api\/?$/i, '')
    .replace(/\/+$/, '');

  // 5. Enforce valid protocol
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    url = `https://${url}`;
  }

  // 6. Hard safety check against literal redaction markers, brackets, or undefined
  if (url.includes('[') || url.includes(']') || url.includes('REDACTED') || url.includes('undefined')) {
    return FALLBACK;
  }

  // 7. Validate that it is a parseable URL and strip any accidental pathname
  try {
    const parsed = new URL(url);
    return `${parsed.protocol}//${parsed.host}`;
  } catch {
    return FALLBACK;
  }
}

const backendUrl = getCleanBackendUrl();

const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**' },
    ],
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${backendUrl}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
