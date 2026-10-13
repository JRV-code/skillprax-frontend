// Fast YouTube player preconnect helper
let isWarmedUp = false;

export function warmUpYouTube(): void {
  if (isWarmedUp || typeof document === 'undefined') return;
  isWarmedUp = true;

  try {
    const urls = [
      'https://www.youtube-nocookie.com',
      'https://i.ytimg.com',
      'https://googleads.g.doubleclick.net',
      'https://static.doubleclick.net',
    ];

    urls.forEach((href) => {
      const link = document.createElement('link');
      link.rel = 'preconnect';
      link.href = href;
      link.crossOrigin = 'anonymous';
      document.head.appendChild(link);

      const dnsPrefetch = document.createElement('link');
      dnsPrefetch.rel = 'dns-prefetch';
      dnsPrefetch.href = href;
      document.head.appendChild(dnsPrefetch);
    });
  } catch (err) {
    // Non-critical optimization
  }
}
