export function getCurrentTime() {
  const timeDiff = typeof window !== 'undefined' ? (window as any)._t_diff : 0;
  return Date.now() - (timeDiff || 0);
}
