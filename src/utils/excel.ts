import XLSX from 'xlsx';
import { openDownloadDialog } from './misc';

/**
 * Convert a sheet to an Excel file Blob.
 * @ref https://www.cnblogs.com/liuxianan/p/js-excel.html
 */
export function sheet2blob(sheet: XLSX.WorkSheet, sheetName?: string): Blob {
  sheetName = sheetName || 'sheet1';
  const workbook = {
    SheetNames: [sheetName],
    Sheets: {},
  };
  workbook.Sheets[sheetName] = sheet;
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

export function tableElem2Excel(table: Element, saveName: string, sheetName?: string) {
  const sheet = XLSX.utils.table_to_sheet(table, { raw: true });
  openDownloadDialog(sheet2blob(sheet, sheetName), saveName);
}

export function aoa2Excel(aoa: any[][], saveName: string, sheetName?: string) {
  const sheet = XLSX.utils.aoa_to_sheet(aoa);
  openDownloadDialog(sheet2blob(sheet, sheetName), saveName);
}

export function sheet2Excel(sheet: XLSX.Sheet, saveName: string, sheetName?: string) {
  openDownloadDialog(sheet2blob(sheet, sheetName), saveName);
}

export function workbook2Excel(workbook: XLSX.WorkBook, saveName: string) {
  openDownloadDialog(workbook2blob(workbook), saveName);
}
