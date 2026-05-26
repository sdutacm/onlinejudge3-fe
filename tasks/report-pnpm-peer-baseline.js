const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const root = path.resolve(__dirname, '..');
const reportPath = path.join(
  root,
  'docs/superpowers/reports/2026-05-24-pnpm-peer-baseline.md',
);
const pnpmBin = process.platform === 'win32' ? 'pnpm.cmd' : 'pnpm';

function normalizeOutput(output) {
  return output
    .replace(/\u001b\[[0-9;]*m/g, '')
    .replaceAll(root + path.sep, '')
    .replaceAll(root, '.')
    .trim();
}

const result = spawnSync(pnpmBin, ['peers', 'check'], {
  cwd: root,
  encoding: 'utf8',
  env: {
    ...process.env,
    FORCE_COLOR: '0',
  },
});

const output = normalizeOutput(`${result.stdout || ''}${result.stderr || ''}`);
const content = [
  '# pnpm Peer Dependency Baseline - 2026-05-24',
  '',
  'This baseline records known peer dependency warnings after moving the project to pnpm. These warnings are accepted in this phase because the runtime stack intentionally remains on React 17 with older React 16-era packages.',
  '',
  '## Command',
  '',
  '```bash',
  'pnpm peers check',
  '```',
  '',
  '## Summary',
  '',
  `Exit status: ${result.status === null ? 1 : result.status}`,
  '',
  'A non-zero exit status is expected for this baseline and is not a CI gate in this phase.',
  '',
  '## Output',
  '',
  '```text',
  output || 'No peer dependency warnings were reported.',
  '```',
  '',
].join('\n');

fs.mkdirSync(path.dirname(reportPath), { recursive: true });
fs.writeFileSync(reportPath, content);
console.log(`Wrote ${path.relative(root, reportPath)}`);
