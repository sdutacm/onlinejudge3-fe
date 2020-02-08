/* eslint-disable */
const fs = require('fs-extra');
const path = require('path');

const srcPath = path.join(__dirname, '..', process.argv[2]);
const destPath = process.argv[3];
console.log(`Deploy  ${srcPath} -> ${destPath}`);

function copyRecursiveSync(src, dest, copyFileFilter = () => true) {
  const fileList = fs.readdirSync(src).filter((name) => name && name !== '.DS_Store');
  const dirs = fileList.filter((f) => fs.statSync(path.join(src, f)).isDirectory());
  const files = fileList.filter((f) => fs.statSync(path.join(src, f)).isFile());
  const orderedFileList = [...dirs, ...files];
  orderedFileList.forEach((f) => {
    const stat = fs.statSync(path.join(src, f));
    const s = path.join(src, f);
    const d = path.join(dest, f);
    if (stat.isDirectory()) {
      fs.ensureDirSync(d);
      copyRecursiveSync(s, d, copyFileFilter);
    } else if (stat.isFile()) {
      const relativePath = d.substring(destPath.length);
      if (copyFileFilter(f, relativePath)) {
        console.log('Copy   ', relativePath);
        fs.copySync(s, d);
      } else {
        console.log('Ignore ', relativePath);
      }
    }
  });
}

fs.ensureDirSync(destPath);
copyRecursiveSync(srcPath, destPath, (file, relativePath) => {
  if (file.endsWith('.css') || file.endsWith('.js') || relativePath.startsWith('static/')) {
    if (fs.pathExistsSync(path.join(destPath, relativePath))) {
      return false;
    }
  }
  return true;
});
