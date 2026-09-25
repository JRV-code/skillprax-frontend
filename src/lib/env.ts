export const getApiUrl = (): string => {
  return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
};

export const getWsUrl = (): string => {
  if (process.env.NEXT_PUBLIC_WS_URL) {
    return process.env.NEXT_PUBLIC_WS_URL;
  }
  const apiUrl = getApiUrl();
  // Automatically upgrade http -> ws and https -> wss for Render edge proxies
  return apiUrl.replace(/^http/, 'ws') + '/ws';
};
