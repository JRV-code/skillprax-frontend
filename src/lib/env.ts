export function getApiUrl(endpoint: string = ''): string {
  const cleanEndpoint = endpoint ? (endpoint.startsWith('/') ? endpoint : `/${endpoint}`) : '';

  // In browser, prefer relative URL to use Next.js rewrites proxy
  if (typeof window !== 'undefined') {
    if (!cleanEndpoint) return '';
    return cleanEndpoint.startsWith('/api') ? cleanEndpoint : `/api${cleanEndpoint}`;
  }

  const rawBase =
    process.env.NEXT_PUBLIC_API_URL ||
    process.env.BACKEND_URL ||
    'https://skillprax-backend.onrender.com';

  let cleanBase = (rawBase || '')
    .trim()
    .replace(/^["'\[]+|["'\]]+$/g, '')
    .replace(/\/api\/:path\*?.*$/i, '')
    .replace(/\/api\/?$/i, '')
    .replace(/\/+$/, '');

  if (cleanBase.includes('=')) {
    cleanBase = cleanBase.split('=').pop()?.trim() || '';
  }

  if (!cleanBase.startsWith('http://') && !cleanBase.startsWith('https://')) {
    cleanBase = `https://${cleanBase}`;
  }

  if (cleanBase.includes('[') || cleanBase.includes(']') || cleanBase.includes('REDACTED')) {
    cleanBase = 'https://skillprax-backend.onrender.com';
  }

  return `${cleanBase}${cleanEndpoint}`;
}

export const getWsUrl = (): string => {
  if (process.env.NEXT_PUBLIC_WS_URL) {
    return process.env.NEXT_PUBLIC_WS_URL;
  }
  const apiUrl = getApiUrl();
  // Automatically upgrade http -> ws and https -> wss for Render edge proxies
  return apiUrl.replace(/^http/, 'ws') + '/ws';
};
