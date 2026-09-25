export const HUD_COLORS = {
  bg: '#090A0F',
  card: '#121520',
  border: '#1E2436',
  cyan: '#00F0FF',
  amber: '#FFB800',
  emerald: '#10B981',
  crimson: '#FF0055',
  purple: '#9D4EDD',
  text: '#E2E8F0',
  muted: '#64748B'
} as const;

export const STATUS_COLORS: Record<string, string> = {
  LOCKED: '#334155',
  AVAILABLE: '#00F0FF',
  IN_PROGRESS: '#FFB800',
  DEMONSTRATED: '#10B981',
  RUSTY: '#F59E0B',
  DETOUR: '#FF0055'
};
