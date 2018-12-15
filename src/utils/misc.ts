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
    _et: Date.now() + expires
  };
}

/**
 * Return whether the state need re-fetch when executing an effect action
 * @param savedState
 * @returns {boolean}
 */
export function isNeedRefetch(savedState): boolean {
  return !savedState || (savedState && savedState._et < Date.now());
}
