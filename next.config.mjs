/** @type {import('next').NextConfig} */
function resolveBackendUrl() {
  let raw = process.env.NEXT_PUBLIC_API_URL || process.env.BACKEND_URL || 'https://skillprax-backend.onrender.com';

  if (!raw || typeof raw !== 'string') {
    return 'https://skillprax-backend.onrender.com';
  }

  // Strip whitespace, surrounding quotes, or accidental formatting
  raw = raw.trim().replace(/^["']|["']$/g, '');

  if (!raw) {
    return 'https://skillprax-backend.onrender.com';
  }

  // Ensure valid URL prefix
  if (!raw.startsWith('http://') && !raw.startsWith('https://')) {
    raw = `https://${raw}`;
  }

  // Remove trailing slashes
  raw = raw.replace(/\/+$/, '');

  return raw;
}

const backendUrl = resolveBackendUrl();

const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
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
