export interface TimeFlag {
  _t: number; // now time
  _et: number; // expiration time
}

/**
 * Generate time flag
 * @param {number} expires in ms
 * @returns {TimeFlag}
 */
export function genTimeFlag(expires: number): TimeFlag {
  return {
    _t: Date.now(),
    _et: Date.now() + expires,
  };
}

/**
 * Return whether the state expired when executing an effect action
 * @param savedState
 * @returns {boolean}
 */
export function isStateExpired(savedState): boolean {
  return !savedState || !savedState._et || (savedState._et < Date.now());
}

/**
 * Clear expired properties in state (only check the top level of the state object)
 * @param state
 * @returns {any}
 */
export function clearExpiredStateProperties(state: any): any {
  const newState = {};
  for (const key in state) {
    if (state.hasOwnProperty(key) && !isStateExpired(state[key])) {
      newState[key] = state[key];
    }
  }
  return newState;
}
