const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

const root = path.resolve(__dirname, '..');
const reportPath = path.join(
  root,
  'docs/superpowers/reports/2026-05-24-umi3-built-assets.md',
);

const targets = [
  {
    name: 'regular',
    dir: 'onlinejudge3',
    publicPath: '/onlinejudge3/',
    keyChunks: [
      /^p__index\..+\.async\.js$/,
      /^p__problems__\$id\..+\.async\.js$/,
      /^p__contests__\$id__ranklist\..+\.async\.js$/,
    ],
    routeLoads: [
      {
        name: '/onlinejudge3/',
        loaders: [
          { marker: 'path:"/",component:Object' },
          { marker: 'path:"/",exact:!0,component:Object' },
        ],
      },
      {
        name: '/onlinejudge3/problems/1000',
        loaders: [
          { marker: 'path:"/",component:Object' },
          { path: '/problems/:id' },
        ],
      },
      {
        name: '/onlinejudge3/contests/1/ranklist',
        loaders: [
          { marker: 'path:"/",component:Object' },
          { path: '/contests/:id', parent: true },
          { path: '/contests/:id/ranklist' },
        ],
      },
      {
        name: '/onlinejudge3/competitions/1/overview',
        loaders: [
          { marker: 'path:"/",component:Object' },
          { path: '/competitions/:id', parent: true },
          { path: '/competitions/:id/overview' },
        ],
      },
    ],
  },
  {
    name: 'competition-side',
    dir: 'onlinejudge3_cs',
    publicPath: '/onlinejudge3_cs/',
    keyChunks: [
      /^p__competitions__\$id__overview\..+\.async\.js$/,
    ],
    routeLoads: [
      {
        name: '/onlinejudge3_cs/competitions/1/overview',
        loaders: [
          { marker: 'path:"/",component:Object' },
          { path: '/competitions/:id', parent: true },
          { path: '/competitions/:id/overview' },
        ],
      },
    ],
  },
];

function readFile(filePath) {
  return fs.readFileSync(filePath);
}

function gzipSize(filePath) {
  return zlib.gzipSync(readFile(filePath)).length;
}

function formatBytes(bytes) {
  if (bytes < 1024) {
    return `${bytes} B`;
  }
  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
}

function sum(files, key) {
  return files.reduce((total, file) => total + file[key], 0);
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

function extractObjectAt(content, startPosition) {
  const start = content.indexOf('{', startPosition);
  if (start < 0) {
    return null;
  }

  let depth = 0;
  let stringQuote = null;
  let escaping = false;
  for (let index = start; index < content.length; index += 1) {
    const char = content[index];
    if (stringQuote) {
      if (escaping) {
        escaping = false;
      } else if (char === '\\') {
        escaping = true;
      } else if (char === stringQuote) {
        stringQuote = null;
      }
      continue;
    }

    if (char === '"' || char === "'" || char === '`') {
      stringQuote = char;
      continue;
    }
    if (char === '{') {
      depth += 1;
    }
    if (char === '}') {
      depth -= 1;
      if (depth === 0) {
        return {
          text: content.slice(start, index + 1),
          end: index + 1,
        };
      }
    }
  }
  return null;
}

function parseNumericStringObject(objectSource) {
  const result = {};
  const pairPattern = /(\d+):"([^"]*)"/g;
  let match;
  while ((match = pairPattern.exec(objectSource))) {
    result[match[1]] = match[2];
  }
  return result;
}

function parseChunkMap(umiContent) {
  const markerMatch = /function \w+\(e\)\{return \w+\.p\+""\+\(/.exec(umiContent);
  if (!markerMatch) {
    return {};
  }

  const namesObject = extractObjectAt(umiContent, markerMatch.index + markerMatch[0].length);
  if (!namesObject) {
    return {};
  }
  const hashMarkerIndex = umiContent.indexOf(')+"."+', namesObject.end);
  if (hashMarkerIndex < 0) {
    return {};
  }
  const hashesObject = extractObjectAt(umiContent, hashMarkerIndex + 6);
  if (!hashesObject) {
    return {};
  }

  const names = parseNumericStringObject(namesObject.text);
  const hashes = parseNumericStringObject(hashesObject.text);
  return Object.keys(hashes).reduce((chunkMap, id) => {
    chunkMap[id] = `${names[id] || id}.${hashes[id]}.async.js`;
    return chunkMap;
  }, {});
}

function parseLoaderIds(snippet) {
  const promiseMatch = snippet.match(/loader:\(\)=>Promise\.all\(\[([^\]]+)\]\)/);
  if (promiseMatch) {
    return [...promiseMatch[1].matchAll(/\b\w+\.e\((\d+)\)/g)].map(match => match[1]);
  }

  const singleMatch = snippet.match(/loader:\(\)=>\w+\.e\((\d+)\)/);
  return singleMatch ? [singleMatch[1]] : [];
}

function findRouteLoaderIds(umiContent, routeLoader) {
  if (routeLoader.marker) {
    const routeStart = umiContent.indexOf(routeLoader.marker);
    if (routeStart < 0) {
      return [];
    }
    return parseLoaderIds(umiContent.slice(routeStart, routeStart + 2000));
  }

  if (routeLoader.parent) {
    const marker = `path:"${routeLoader.path}",routes:`;
    const routeStart = umiContent.indexOf(marker);
    if (routeStart < 0) {
      return [];
    }
    const snippet = umiContent.slice(routeStart, routeStart + 50000);
    const componentIndex = snippet.indexOf('}],component:Object');
    if (componentIndex < 0) {
      return [];
    }
    return parseLoaderIds(snippet.slice(componentIndex, componentIndex + 1500));
  }

  const marker = `path:"${routeLoader.path}"`;
  const occurrence = routeLoader.occurrence || 0;
  let searchFrom = 0;
  for (let index = 0; index <= occurrence; index += 1) {
    searchFrom = umiContent.indexOf(marker, searchFrom);
    if (searchFrom < 0) {
      return [];
    }
    if (index < occurrence) {
      searchFrom += marker.length;
    }
  }
  return parseLoaderIds(umiContent.slice(searchFrom, searchFrom + 1500));
}

function fileInfo(outputDir, file) {
  const filePath = path.join(outputDir, file);
  const bytes = fs.statSync(filePath).size;
  return {
    file,
    bytes,
    gzipBytes: gzipSize(filePath),
  };
}

function routeLoadInfo(outputDir, umiContent, route) {
  const chunkMap = parseChunkMap(umiContent);
  const chunkIds = [...new Set(route.loaders.flatMap(loader => findRouteLoaderIds(umiContent, loader)))];
  const files = chunkIds
    .map(id => chunkMap[id])
    .filter(file => file && fs.existsSync(path.join(outputDir, file)))
    .map(file => fileInfo(outputDir, file));
  return {
    ...route,
    files,
  };
}

function markdownTable(headers, rows) {
  return [
    `| ${headers.join(' | ')} |`,
    `| ${headers.map(() => '---').join(' | ')} |`,
    ...rows.map(row => `| ${row.join(' | ')} |`),
  ].join('\n');
}

function collectTarget(target) {
  const outputDir = path.join(root, target.dir);
  if (!fs.existsSync(outputDir)) {
    throw new Error(`Missing build output directory: ${target.dir}`);
  }

  const files = fs.readdirSync(outputDir).sort();
  const htmlPath = path.join(outputDir, 'index.html');
  if (!fs.existsSync(htmlPath)) {
    throw new Error(`Missing ${target.dir}/index.html`);
  }

  const html = fs.readFileSync(htmlPath, 'utf8');
  const jsFiles = files.filter(file => /\.js$/.test(file));
  const asyncFiles = jsFiles.filter(file => /\.async\.js$/.test(file));
  const initialScriptNames = parseInitialScripts(html, target.publicPath);
  const umiFile = initialScriptNames.find(file => /^umi\..+\.js$/.test(file));
  const umiContent = umiFile && fs.existsSync(path.join(outputDir, umiFile))
    ? fs.readFileSync(path.join(outputDir, umiFile), 'utf8')
    : '';
  const initialFiles = initialScriptNames
    .filter(file => fs.existsSync(path.join(outputDir, file)))
    .map(file => fileInfo(outputDir, file));
  const asyncChunks = asyncFiles.map(file => fileInfo(outputDir, file));
  const allJs = jsFiles.map(file => fileInfo(outputDir, file));
  const keyChunks = target.keyChunks.map(pattern => {
    const matched = asyncChunks.find(chunk => pattern.test(chunk.file));
    return matched || { file: `Missing: ${pattern}`, bytes: 0, gzipBytes: 0 };
  });

  return {
    ...target,
    initialFiles,
    asyncChunks,
    allJs,
    keyChunks,
    routeLoads: (target.routeLoads || []).map(route => routeLoadInfo(outputDir, umiContent, route)),
  };
}

function renderTarget(target) {
  const summaryRows = [
    ['Initial JS', target.initialFiles.length, formatBytes(sum(target.initialFiles, 'bytes')), formatBytes(sum(target.initialFiles, 'gzipBytes'))],
    ['Async JS chunks', target.asyncChunks.length, formatBytes(sum(target.asyncChunks, 'bytes')), formatBytes(sum(target.asyncChunks, 'gzipBytes'))],
    ['All JS', target.allJs.length, formatBytes(sum(target.allJs, 'bytes')), formatBytes(sum(target.allJs, 'gzipBytes'))],
  ];

  const initialRows = target.initialFiles.map(file => [
    file.file,
    formatBytes(file.bytes),
    formatBytes(file.gzipBytes),
  ]);

  const keyRows = target.keyChunks.map(file => [
    file.file,
    formatBytes(file.bytes),
    formatBytes(file.gzipBytes),
  ]);
  const initialBytes = sum(target.initialFiles, 'bytes');
  const initialGzipBytes = sum(target.initialFiles, 'gzipBytes');
  const routeRows = target.routeLoads.map(route => [
    route.name,
    route.files.length,
    formatBytes(sum(route.files, 'bytes')),
    formatBytes(sum(route.files, 'gzipBytes')),
    formatBytes(initialBytes + sum(route.files, 'bytes')),
    formatBytes(initialGzipBytes + sum(route.files, 'gzipBytes')),
  ]);
  const routeDetails = target.routeLoads.flatMap(route => [
    `#### ${route.name}`,
    '',
    route.files.length
      ? markdownTable(
        ['File', 'Size', 'Gzip size'],
        route.files.map(file => [
          file.file,
          formatBytes(file.bytes),
          formatBytes(file.gzipBytes),
        ]),
      )
      : 'No route JS chunk files were found.',
    '',
  ]);

  return [
    `## ${target.name} (${target.dir})`,
    '',
    markdownTable(['Group', 'Count', 'Size', 'Gzip size'], summaryRows),
    '',
    '### Initial JS',
    '',
    initialRows.length
      ? markdownTable(['File', 'Size', 'Gzip size'], initialRows)
      : 'No initial JS files were found in index.html.',
    '',
    '### Key Route Chunks',
    '',
    markdownTable(['File', 'Size', 'Gzip size'], keyRows),
    '',
    '### Route Loader JS',
    '',
    routeRows.length
      ? markdownTable(
        ['Route', 'Count', 'Route JS', 'Route gzip', 'Initial + route JS', 'Initial + route gzip'],
        routeRows,
      )
      : 'No route loader JS rows were configured.',
    '',
    ...routeDetails,
    '',
  ].join('\n');
}

function main() {
  const collected = targets.map(collectTarget);
  const generatedAt = new Date().toISOString();
  const content = [
    '# Umi3 Built Asset Snapshot - 2026-05-24',
    '',
    `Generated at: ${generatedAt}`,
    '',
    'This is the forward-looking bundle baseline after the Umi 3 route-level dynamic import migration. It does not reconstruct the old Umi 2 baseline.',
    '',
    'Analysis notes:',
    '',
    '- `index.html` should only inject `umi.*.js`; large vendor chunks must stay behind route/runtime loaders.',
    '- `Route Loader JS` is parsed from the Umi webpack runtime and excludes the initial `umi.*.js` unless shown in the `Initial + route` columns.',
    '- Webpack `default~...` chunk names list every async route sharing that module set; these are shared modules, not full page entries.',
    '- Excel export and rich-text editor dependencies are intentionally loaded from user-triggered async paths rather than initial route entrypoints.',
    '',
    ...collected.map(renderTarget),
    '',
  ].join('\n');

  fs.mkdirSync(path.dirname(reportPath), { recursive: true });
  fs.writeFileSync(reportPath, content);
  console.log(`Wrote ${path.relative(root, reportPath)}`);
}

main();
