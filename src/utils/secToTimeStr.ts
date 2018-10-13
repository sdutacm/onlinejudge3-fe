function preZeroFill(num: number, size: number): string {
  if (num >= Math.pow(10, size)) {
    return num.toString();
  }
  else {
    let str = Array(size + 1).join('0') + num;
    return str.slice(str.length - size);
  }
}

export default function secToTimeStr(second, showDay = false) {
  let sec = second;
  let d;
  if (showDay) {
    // let d = Number(sec / 86400);
    sec %= 86400;
  }
  let h = Number(sec / 3600);
  sec %= 3600;
  let m = Number(sec / 60);
  sec %= 60;
  let s = Number(sec);
  let str_d = '';
  if (showDay && d >= 1) {
    str_d = d + 'D ';
  }
  if (sec < 0) {
    return '--';
  }
  return str_d + preZeroFill(h, 2) + ':' + preZeroFill(m, 2) + ':' + preZeroFill(s, 2);
}
