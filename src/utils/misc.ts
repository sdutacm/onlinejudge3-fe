import Cookies from 'js-cookie';
import { forEach, isObject } from 'lodash';

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
  return !savedState || !savedState._et || savedState._et < Date.now();
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

/**
 * Sleep some time
 * @param ms sleep duration
 */
export function sleep(ms: number): Promise<void> {
  return new Promise((rs, _rj) => {
    setTimeout(() => rs(), ms);
  });
}

/**
 * 通用的打开下载对话框方法，没有测试过具体兼容性
 * @param url 下载地址，也可以是一个blob对象，必选
 * @param saveName 保存文件名，可选
 * @ref https://www.cnblogs.com/liuxianan/p/js-excel.html
 */
export function openDownloadDialog(url: string | Blob, saveName?: string) {
  if (typeof url === 'object' && url instanceof Blob) {
    url = URL.createObjectURL(url); // 创建blob地址
  }
  const aLink = document.createElement('a');
  aLink.href = url;
  aLink.download = saveName || ''; // HTML5新增的属性，指定保存文件名，可以不要后缀，注意，file:///模式下不会生效
  let event;
  if (window.MouseEvent) event = new MouseEvent('click');
  else {
    event = document.createEvent('MouseEvents');
    event.initMouseEvent(
      'click',
      true,
      false,
      window,
      0,
      0,
      0,
      0,
      0,
      false,
      false,
      false,
      false,
      0,
      null,
    );
  }
  aLink.dispatchEvent(event);
}

/**
 * Get header with csrf token
 */
export function getCsrfHeader() {
  return {
    'x-csrf-token': Cookies.get('csrfToken'),
  };
}

/**
 * 转换 base64 到 blob（async）
 * @param base64
 * @param type
 */
export function b64toBlob(base64, type = 'application/octet-stream') {
  return fetch(`data:${type};base64,${base64}`).then((res) => res.blob());
}

export function isCompetitionSide() {
  return process.env.COMPETITION_SIDE === '1';
}

export function randomlyPickOne<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function replaceString(str: string, sourceString: string[], targetString: string): string {
  let result = str;
  sourceString.forEach((sourcePath) => {
    // 为了安全地替换字符串，需要对 sourcePath 进行转义，因为它可能包含正则表达式的特殊字符
    const escapedSourcePath = sourcePath.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
    const regex = new RegExp(escapedSourcePath, 'g');
    result = result.replace(regex, targetString);
  });
  return result;
}

export function collectObjectKeysAsPaths(obj, parentKey = '') {
  let keys: string[] = [];

  forEach(obj, (value, key) => {
    const fullKey = parentKey ? `${parentKey}.${key}` : key;
    if (isObject(value) && !Array.isArray(value)) {
      keys = keys.concat(collectObjectKeysAsPaths(value, fullKey));
    } else if (Array.isArray(value)) {
      value.forEach((item, index) => {
        keys = keys.concat(collectObjectKeysAsPaths(item, `${fullKey}.${index}`));
      });
    } else {
      keys.push(fullKey);
    }
  });

  return keys;
}
