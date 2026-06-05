import NProgress from 'nprogress';

NProgress.configure({
  minimum: 0.08,
  showSpinner: false,
  trickleSpeed: 120,
});

const activeTokens = new Set<unknown>();

export function beginRouteProgress(token: unknown) {
  const shouldStart = activeTokens.size === 0;
  activeTokens.add(token);
  if (shouldStart) {
    NProgress.start();
  }
}

export function finishRouteProgress(token: unknown) {
  activeTokens.delete(token);
  if (activeTokens.size === 0) {
    NProgress.done();
  }
}
