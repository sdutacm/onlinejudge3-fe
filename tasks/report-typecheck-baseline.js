const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const root = path.resolve(__dirname, '..');
const reportPath = path.join(
  root,
  'docs/superpowers/reports/2026-05-24-ts49-typecheck-baseline.md',
);
const tscPath = require.resolve('typescript/bin/tsc');
const args = [
  tscPath,
  '-p',
  'tsconfig.json',
  '--noEmit',
  '--pretty',
  'false',
  '--skipLibCheck',
];

function normalizeOutput(output) {
  return output
    .replace(/\u001b\[[0-9;]*m/g, '')
    .replaceAll(root + path.sep, '')
    .replaceAll(root, '.')
    .trim();
}

function summarizeCodes(output) {
  const counts = new Map();
  for (const match of output.matchAll(/error (TS\d+):/g)) {
    counts.set(match[1], (counts.get(match[1]) || 0) + 1);
  }
  return Array.from(counts.entries()).sort((a, b) => a[0].localeCompare(b[0]));
}

function markdownTable(headers, rows) {
  return [
    `| ${headers.join(' | ')} |`,
    `| ${headers.map(() => '---').join(' | ')} |`,
    ...rows.map(row => `| ${row.join(' | ')} |`),
  ].join('\n');
}

const result = spawnSync(process.execPath, args, {
  cwd: root,
  encoding: 'utf8',
  env: {
    ...process.env,
    FORCE_COLOR: '0',
  },
});

const output = normalizeOutput(`${result.stdout || ''}${result.stderr || ''}`);
const lines = output ? output.split('\n') : [];
const codeRows = summarizeCodes(output).map(([code, count]) => [code, String(count)]);
const excerptLimit = 200;
const excerpt = lines.slice(0, excerptLimit).join('\n');

const content = [
  '# TypeScript 4.9 Typecheck Baseline - 2026-05-24',
  '',
  'This baseline is informational. `typecheck` is not a CI gate in the Node 24 + pnpm 11 upgrade phase because existing application type errors are still being tracked as technical debt.',
  '',
  '## Command',
  '',
  '```bash',
  'pnpm run typecheck',
  '```',
  '',
  '## Summary',
  '',
  markdownTable(['Metric', 'Value'], [
    ['TypeScript target', '4.9.5'],
    ['Exit status', String(result.status === null ? 1 : result.status)],
    ['Error lines', String(lines.filter(line => /error TS\d+:/.test(line)).length)],
    ['Output lines', String(lines.length)],
  ]),
  '',
  '## Error Codes',
  '',
  codeRows.length ? markdownTable(['Code', 'Count'], codeRows) : 'No TypeScript errors were reported.',
  '',
  '## Output Excerpt',
  '',
  '```text',
  excerpt,
  lines.length > excerptLimit ? `... truncated ${lines.length - excerptLimit} additional lines ...` : '',
  '```',
  '',
].join('\n');

fs.mkdirSync(path.dirname(reportPath), { recursive: true });
fs.writeFileSync(reportPath, content);
console.log(`Wrote ${path.relative(root, reportPath)}`);
