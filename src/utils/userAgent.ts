export const botUA = ['Googlebot', 'bingbot', 'Baiduspider', 'sdutacmbot'];

export function isBot() {
  return !!botUA.find(ua => navigator.userAgent.indexOf(ua) > -1);
}
