const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');

const targets = [
  {
    dir: 'onlinejudge3',
    publicPath: '/onlinejudge3/',
    chunks: [
      /^p__index\..+\.async\.js$/,
      /^p__problems__\$id\..+\.async\.js$/,
      /^p__contests__\$id__ranklist\..+\.async\.js$/,
    ],
  },
  {
    dir: 'onlinejudge3_cs',
    publicPath: '/onlinejudge3_cs/',
    chunks: [
      /^p__competitions__\$id__overview\..+\.async\.js$/,
    ],
  },
];

function assert(condition, message) {
  if (!condition) {
    console.error(message);
    process.exitCode = 1;
  }
}

function listFiles(dir) {
  if (!fs.existsSync(dir)) {
    return [];
  }
  return fs.readdirSync(dir);
}

function parseInitialScripts(html, publicPath) {
  const scripts = [];
  const scriptPattern = /<script\b[^>]*\bsrc=["']([^"']+\.js(?:\?[^"']*)?)["'][^>]*>/g;
  let match;
  while ((match = scriptPattern.exec(html))) {
    const src = match[1].split('?')[0];
    const normalized = src.startsWith(publicPath)
      ? src.slice(publicPath.length)
      : src.replace(/^[/\\]+/, '');
    scripts.push(path.basename(normalized));
  }
  return scripts;
}

targets.forEach((target) => {
  const outputDir = path.join(root, target.dir);
  const files = listFiles(outputDir);
  const htmlPath = path.join(outputDir, 'index.html');
  const umiFile = files.find(file => /^umi\..+\.js$/.test(file));

  assert(files.length > 0, `Missing output directory or files: ${target.dir}`);
  assert(fs.existsSync(htmlPath), `Missing ${target.dir}/index.html`);
  assert(!!umiFile, `Missing ${target.dir}/umi.*.js`);

  if (umiFile) {
    const html = fs.readFileSync(htmlPath, 'utf8');
    const initialScripts = parseInitialScripts(html, target.publicPath);
    const umiContent = fs.readFileSync(path.join(outputDir, umiFile), 'utf8');
    assert(
      initialScripts.length === 1 && initialScripts[0] === umiFile,
      `Unexpected initial scripts in ${target.dir}/index.html: ${initialScripts.join(', ')}`,
    );
    assert(
      initialScripts.every(file => !/\.async\.js$/.test(file)),
      `Async chunks should not be injected as initial scripts in ${target.dir}/index.html`,
    );
    assert(
      umiContent.includes(`p="${target.publicPath}"`) ||
        umiContent.includes(`p='${target.publicPath}'`),
      `Unexpected public path in ${target.dir}/${umiFile}; expected ${target.publicPath}`,
    );
  }

  target.chunks.forEach((chunkPattern) => {
    assert(
      files.some(file => chunkPattern.test(file)),
      `Missing route chunk in ${target.dir}: ${chunkPattern}`,
    );
  });
});

if (process.exitCode) {
  process.exit(process.exitCode);
}

console.log('Verified built output public paths and route chunks.');
