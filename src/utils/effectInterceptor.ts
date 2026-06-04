import { Action, Dispatch } from '@/@types/props';

// 将 subscriptions 中的 dispatch 拦截并延后到 session loaded

const EI_DEBUG = false;

// dva runs every model's subscription `setup` on the server too (per-request
// app.start()), so these window-backed helpers must be inert during SSR. The
// server prefetches via getInitialProps and dispatches effects directly, so no
// interception is needed there.
const isServer = typeof window === 'undefined';

export function initInterceptor() {
  if (isServer) {
    return;
  }
  if ((window as any)._pendingEffectsInited) {
    return;
  }
  EI_DEBUG && console.log('[initInterceptor]');
  (window as any)._sessionLoading = true;
  (window as any)._pendingEffects = [];
  (window as any)._pendingEffectsInited = true;
}

export function startInterception() {
  if (isServer) {
    return;
  }
  (window as any)._sessionLoading = true;
}

export function requestEffect(dispatch: Dispatch<Action>, action: Action) {
  if (isServer) {
    dispatch(action);
    return;
  }
  if (!(window as any)._pendingEffectsInited) {
    EI_DEBUG && console.log('[requestEffect] init');
    initInterceptor();
  }
  if ((window as any)._sessionLoading) {
    (window as any)._pendingEffects.push({ dispatch, action });
    EI_DEBUG && console.log('[requestEffect] push', action, (window as any)._pendingEffects);
  }
  else {
    dispatch(action);
    EI_DEBUG && console.log('[requestEffect] dispatch', action);
  }
}

export function endInterception() {
  if (isServer) {
    return;
  }
  EI_DEBUG && console.log('[endInterception]', (window as any)._pendingEffects);
  (window as any)._pendingEffects.forEach(({ dispatch, action }) => dispatch(action));
  (window as any)._pendingEffects = [];
  (window as any)._sessionLoading = false;
}
