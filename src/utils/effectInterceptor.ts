import { Action, Dispatch } from '@/@types/props';

// 将 subscriptions 中的 dispatch 拦截并延后到 session loaded

export function initInterceptor() {
  if ((window as any)._pendingEffectsInited) {
    return;
  }
  // console.log('[initInterceptor]');
  (window as any)._sessionLoading = true;
  (window as any)._pendingEffects = [];
  (window as any)._pendingEffectsInited = true;
}

export function startInterception() {
  (window as any)._sessionLoading = true;
}

export function requestEffect(dispatch: Dispatch<Action>, action: Action) {
  if (!(window as any)._pendingEffectsInited) {
    // console.log('[requestEffect] init');
    initInterceptor();
  }
  if ((window as any)._sessionLoading) {
    (window as any)._pendingEffects.push({ dispatch, action });
    // console.log('[requestEffect] push', action, (window as any)._pendingEffects);
  }
  else {
    dispatch(action);
    // console.log('[requestEffect] dispatch', action);
  }
}

export function endInterception() {
  // console.log('[endInterception]', (window as any)._pendingEffects);
  (window as any)._pendingEffects.forEach(({ dispatch, action }) => dispatch(action));
  (window as any)._pendingEffects = [];
  (window as any)._sessionLoading = false;
}
