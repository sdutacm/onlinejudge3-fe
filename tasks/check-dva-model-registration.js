const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const generatedDva = path.join(root, 'src/.umi/plugin-dva/dva.ts');

function walk(dir, predicate, files = []) {
  if (!fs.existsSync(dir)) {
    return files;
  }

  fs.readdirSync(dir, { withFileTypes: true }).forEach((entry) => {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(fullPath, predicate, files);
      return;
    }
    if (predicate(fullPath)) {
      files.push(fullPath);
    }
  });

  return files;
}

function isModelFile(filePath) {
  return path.basename(path.dirname(filePath)) === 'models' && /\.tsx?$/.test(filePath);
}

const globalModelFiles = walk(path.join(root, 'src/models'), filePath => /\.tsx?$/.test(filePath));
const pageModelFiles = walk(path.join(root, 'src/pages'), isModelFile);
const expectedNamespaces = [...globalModelFiles, ...pageModelFiles]
  .map(filePath => path.basename(filePath).replace(/\.[^.]+$/, ''))
  .sort();

if (!fs.existsSync(generatedDva)) {
  console.error(`Missing generated dva runtime: ${path.relative(root, generatedDva)}`);
  console.error('Run `npm run build` or `npm run start` before this check.');
  process.exit(1);
}

const generated = fs.readFileSync(generatedDva, 'utf8');
const registeredNamespaces = new Set();
const namespacePattern = /app\.model\(\{\s*namespace:\s*['"]([^'"]+)['"]/g;
let match;

while ((match = namespacePattern.exec(generated))) {
  registeredNamespaces.add(match[1]);
}

const missing = expectedNamespaces.filter(namespace => !registeredNamespaces.has(namespace));
const extra = [...registeredNamespaces]
  .filter(namespace => !expectedNamespaces.includes(namespace))
  .sort();

if (missing.length || extra.length) {
  if (missing.length) {
    console.error(`Missing dva model registrations: ${missing.join(', ')}`);
  }
  if (extra.length) {
    console.error(`Unexpected dva model registrations: ${extra.join(', ')}`);
  }
  process.exit(1);
}

console.log(`Verified ${expectedNamespaces.length} dva model registrations.`);
