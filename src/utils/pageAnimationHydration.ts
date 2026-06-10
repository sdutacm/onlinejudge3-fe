const SSR_HYDRATION_PAGE_ANIMATION_DONE = '__oj3SSRHydrationPageAnimationDone';

function getWindow(): any {
  return typeof window === 'undefined' ? null : window;
}

export function shouldSkipInitialPageAnimation() {
  const w = getWindow();
  if (!w) {
    return true;
  }
  return !!w.g_useSSR && !w[SSR_HYDRATION_PAGE_ANIMATION_DONE];
}

export function markInitialPageAnimationMounted() {
  const w = getWindow();
  if (w && w.g_useSSR) {
    w[SSR_HYDRATION_PAGE_ANIMATION_DONE] = true;
  }
}
