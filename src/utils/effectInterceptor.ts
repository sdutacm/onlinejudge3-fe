import { Action, Dispatch } from '@/@types/props';

// 将 subscriptions 中的 dispatch 拦截并延后到 session loaded

export function initInterceptor() {
  (window as any)._sessionLoading = true;
  (window as any)._pendingEffects = [];
}

export function startInterception() {
  (window as any)._sessionLoading = true;
}

export function requestEffect(dispatch: Dispatch<Action>, action: Action) {
  if (!Array.isArray((window as any)._pendingEffects)) {
    initInterceptor();
  }
  if ((window as any)._sessionLoading) {
    (window as any)._pendingEffects.push({ dispatch, action });
  }
  else {
    dispatch(action);
  }
}

export function endInterception() {
  (window as any)._pendingEffects.forEach(({ dispatch, action }) => dispatch(action));
  (window as any)._pendingEffects = [];
  (window as any)._sessionLoading = false;
}
