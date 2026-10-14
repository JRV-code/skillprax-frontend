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
let readyPromise: Promise<any> | null = null;
let currentId: string | null = null;
let prewarming = false;

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

export function getPlayer(mount: HTMLElement): Promise<any> {
  if (player && readyPromise) return readyPromise;
  readyPromise = loadYouTubeApi().then(
    (YT) =>
      new Promise<any>((resolve) => {
        player = new YT.Player(mount, {
          host: 'https://www.youtube-nocookie.com',
          width: '100%',
          height: '100%',
          playerVars: {
            rel: 0,
            modestbranding: 1,
            playsinline: 1,
            enablejsapi: 1,
            origin: typeof window !== 'undefined' ? window.location.origin : '',
          },
          events: {
            onReady: () => resolve(player),
            onStateChange: (e: any) => {
              if (prewarming && e.data === 1) {
                player.pauseVideo();
                prewarming = false;
              }
              stateListeners.forEach((cb) => cb(e.data));
            },
            onError: (e: any) => errorListeners.forEach((cb) => cb(e.data)),
          },
        });
      })
  );
  return readyPromise;
}

export const canPrewarm = () => {
  if (typeof navigator === 'undefined') return false;
  const c = (navigator as any).connection;
  return !c?.saveData && (!c?.effectiveType || c.effectiveType === '4g');
};

// Buffer the first seconds muted and paused so the click starts instantly
export async function prewarm(mount: HTMLElement, videoId: string, startSeconds = 0) {
  if (!canPrewarm() || currentId === videoId) return;
  const p = await getPlayer(mount);
  currentId = videoId;
  prewarming = true;
  p.mute();
  p.loadVideoById({ videoId, startSeconds });
}

export async function play(mount: HTMLElement, videoId: string, startSeconds = 0) {
  const p = await getPlayer(mount);
  prewarming = false;
  if (currentId !== videoId) {
    currentId = videoId;
    p.loadVideoById({ videoId, startSeconds });
  } else if (startSeconds > 0) {
    p.seekTo(startSeconds, true);
  }
  p.unMute();
  p.playVideo();
}

export function getCurrentPlayerInstance() {
  return player;
}
