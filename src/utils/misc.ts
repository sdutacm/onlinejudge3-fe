import XLSX from 'xlsx';
import Cookies from 'js-cookie';

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
 * 将一个sheet转成最终的excel文件的blob对象，然后利用URL.createObjectURL下载
 * @param sheet
 * @param sheetName
 * @ref https://www.cnblogs.com/liuxianan/p/js-excel.html
 */
export function sheet2blob(sheet: XLSX.WorkSheet, sheetName?: string): Blob {
  sheetName = sheetName || 'sheet1';
  const workbook = {
    SheetNames: [sheetName],
    Sheets: {},
  };
  workbook.Sheets[sheetName] = sheet;
  // 生成excel的配置项
  const wopts: XLSX.WritingOptions = {
    bookType: 'xlsx', // 要生成的文件类型
    bookSST: false, // 是否生成Shared String Table，官方解释是，如果开启生成速度会下降，但在低版本IOS设备上有更好的兼容性
    type: 'binary',
  };
  const wbout = XLSX.write(workbook, wopts);
  const blob = new Blob([s2ab(wbout)], { type: 'application/octet-stream' });
  // 字符串转ArrayBuffer
  function s2ab(s) {
    const buf = new ArrayBuffer(s.length);
    const view = new Uint8Array(buf);
    for (let i = 0; i !== s.length; ++i) view[i] = s.charCodeAt(i) & 0xff;
    return buf;
  }
  return blob;
}

/**
 * Workbook to Blob
 * @param workbook XLSX workbook
 */
export function workbook2blob(workbook: XLSX.WorkBook): Blob {
  const wopts: XLSX.WritingOptions = {
    bookType: 'xlsx',
    bookSST: false,
    type: 'binary',
  };
  const wbout = XLSX.write(workbook, wopts);
  const blob = new Blob([s2ab(wbout)], { type: 'application/octet-stream' });
  function s2ab(s) {
    const buf = new ArrayBuffer(s.length);
    const view = new Uint8Array(buf);
    for (let i = 0; i !== s.length; ++i) view[i] = s.charCodeAt(i) & 0xff;
    return buf;
  }
  return blob;
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
 * Export <table> to Excel
 * @param table <table> dom element
 * @param saveName save file name
 * @param sheet sheet name
 */
export function tableElem2Excel(table: Element, saveName: string, sheetName?: string) {
  const sheet = XLSX.utils.table_to_sheet(table, { raw: true });
  openDownloadDialog(sheet2blob(sheet, sheetName), saveName);
}

/**
 * Export array of array to Excel
 * @param aoa array of arrau data
 * @param saveName save file name
 * @param sheet sheet name
 */
export function aoa2Excel(aoa: any[][], saveName: string, sheetName?: string) {
  const sheet = XLSX.utils.aoa_to_sheet(aoa);
  openDownloadDialog(sheet2blob(sheet, sheetName), saveName);
}

/**
 * Export XLSX sheet to Excel
 * @param sheet
 * @param saveName save file name
 * @param sheet sheet name
 */
export function sheet2Excel(sheet: XLSX.Sheet, saveName: string, sheetName?: string) {
  openDownloadDialog(sheet2blob(sheet, sheetName), saveName);
}

/**
 * Export XLSX workbook to Excel
 * @param workbook
 * @param saveName save file name
 */
export function workbook2Excel(workbook: XLSX.WorkBook, saveName: string) {
  openDownloadDialog(workbook2blob(workbook), saveName);
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
