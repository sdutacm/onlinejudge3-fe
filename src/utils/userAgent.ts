export const botUA = ['Googlebot', 'bingbot', 'Baiduspider', 'sdutacmbot'];

export function isBot() {
  // Server-safe: `navigator` is unavailable during SSR.
  if (typeof navigator === 'undefined') {
    return false;
  }
  return !!botUA.find(ua => navigator.userAgent.indexOf(ua) > -1);
}
