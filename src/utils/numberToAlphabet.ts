export default function (number) {
  let n = parseInt(number, 10);
  let radix = 26;
  let cnt = 1;
  let p = radix;
  while (n >= p) {
    n -= p;
    cnt++;
    p *= radix;
  }
  let res = [];
  for (; cnt > 0; cnt--) {
    res.push(String.fromCharCode(n % radix + 65));
    n /= radix;
  }
  return res.reverse().join('');
}
