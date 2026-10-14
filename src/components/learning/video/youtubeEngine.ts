declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: () => void;
  }
}

type Cb = (state: number) => void;
type ErrCb = (code: number) => void;

let apiPromise: Promise<any> | null = null;
let player: any = null;
let currentId: string | null = null;

const stateListeners = new Set<Cb>();
const errorListeners = new Set<ErrCb>();

export const onPlayerState = (cb: Cb) => {
  stateListeners.add(cb);
  return () => {
    stateListeners.delete(cb);
  };
};

export const onPlayerError = (cb: ErrCb) => {
  errorListeners.add(cb);
  return () => {
    errorListeners.delete(cb);
  };
};

export function loadYouTubeApi(): Promise<any> {
  if (typeof window === 'undefined') return Promise.reject(new Error('ssr'));
  if (window.YT?.Player) return Promise.resolve(window.YT);
  if (apiPromise) return apiPromise;

  apiPromise = new Promise((resolve) => {
    const prev = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      prev?.();
      resolve(window.YT);
    };
    const s = document.createElement('script');
    s.src = 'https://www.youtube.com/iframe_api';
    s.async = true;
    document.head.appendChild(s);
  });
  return apiPromise;
}

export function getPlayer(mount: HTMLElement, videoId?: string): Promise<any> {
  return loadYouTubeApi().then((YT) => {
    return new Promise<any>((resolve) => {
      if (player && typeof player.getPlayerState === 'function') {
        const iframe = player.getIframe?.();
        if (iframe && mount && iframe.parentElement !== mount) {
          mount.innerHTML = '';
          mount.appendChild(iframe);
        }
        return resolve(player);
      }

      // If existing dead player, clean up
      try {
        if (player && player.destroy) player.destroy();
      } catch (_) {}

      mount.innerHTML = '';
      const playerDiv = document.createElement('div');
      playerDiv.className = 'w-full h-full pointer-events-auto';
      mount.appendChild(playerDiv);

      player = new YT.Player(playerDiv, {
        host: 'https://www.youtube-nocookie.com',
        width: '100%',
        height: '100%',
        videoId: videoId || undefined,
        playerVars: {
          autoplay: 1,
          controls: 1,
          rel: 0,
          modestbranding: 1,
          playsinline: 1,
          enablejsapi: 1,
          cc_load_policy: 1,
          origin: typeof window !== 'undefined' ? window.location.origin : '',
        },
        events: {
          onReady: () => resolve(player),
          onStateChange: (e: any) => {
            stateListeners.forEach((cb) => cb(e.data));
          },
          onError: (e: any) => errorListeners.forEach((cb) => cb(e.data)),
        },
      });
    });
  });
}

export const canPrewarm = () => {
  if (typeof navigator === 'undefined') return false;
  const c = (navigator as any).connection;
  return !c?.saveData && (!c?.effectiveType || c.effectiveType === '4g');
};

export async function prewarm(mount?: HTMLElement, videoId?: string) {
  // Prewarm API script only without creating detached iframes
  try {
    await loadYouTubeApi();
  } catch (_) {}
}

export async function play(mount: HTMLElement, videoId: string, startSeconds = 0) {
  const p = await getPlayer(mount, videoId);
  if (currentId !== videoId) {
    currentId = videoId;
    if (p.loadVideoById) {
      p.loadVideoById({ videoId, startSeconds });
    }
  } else if (startSeconds > 0 && p.seekTo) {
    p.seekTo(startSeconds, true);
  }
  if (p.unMute) p.unMute();
  if (p.playVideo) p.playVideo();
}

export function pauseVideo() {
  try {
    if (player?.pauseVideo) player.pauseVideo();
  } catch (_) {}
}

export function getCurrentPlayerInstance() {
  return player;
}
