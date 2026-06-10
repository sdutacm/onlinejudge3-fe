'use strict';

const { test } = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');

const root = path.join(__dirname, '../..');

function readProjectFile(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), 'utf-8');
}

test('SSR Dockerfile installs production deps and runs pm2-runtime in foreground', () => {
  const dockerfile = readProjectFile('Dockerfile.ssr');

  assert.match(dockerfile, /FROM node:24-bookworm-slim AS deps/);
  assert.match(dockerfile, /pnpm install --prod --frozen-lockfile/);
  assert.match(dockerfile, /COPY server \.\/server/);
  assert.match(dockerfile, /COPY src\/configs\/ssr\.js \.\/src\/configs\/ssr\.js/);
  assert.match(dockerfile, /COPY onlinejudge3 \.\/onlinejudge3/);
  assert.match(dockerfile, /NODE_WORKERS=1/);
  assert.match(dockerfile, /pm2-runtime", "start", "ecosystem\.config\.js"/);
});

test('pm2 SSR config uses NODE_WORKERS with a one-worker default', () => {
  const ecosystem = readProjectFile('ecosystem.config.js');

  assert.match(ecosystem, /process\.env\.NODE_WORKERS \|\| process\.env\.SSR_WORKERS \|\| 1/);
});

test('CDN upload skips SSR server-only build artifacts', () => {
  const upload = readProjectFile('tasks/upload-cdn.js');

  assert.match(upload, /SERVER_ONLY_FILES/);
  assert.match(upload, /umi\\.server\\.js/);
  assert.match(upload, /filter\(isUploadableFile\)/);
});

test('release CI builds SSR output, uploads frontend assets, and pushes DockerHub image', () => {
  const workflow = readProjectFile('.github/workflows/ci.yml');

  assert.match(workflow, /pnpm run build:ssr/);
  assert.match(workflow, /node tasks\/upload-cdn\.js/);
  assert.match(workflow, /docker\/login-action@v3/);
  assert.match(workflow, /docker\/metadata-action@v5/);
  assert.match(workflow, /docker\/build-push-action@v6/);
  assert.match(workflow, /images: \$\{\{ secrets\.DOCKERHUB_USERNAME \}\}\/onlinejudge3-ssr/);
  assert.match(workflow, /file: Dockerfile\.ssr/);
  assert.match(workflow, /push: true/);
});

test('compose template exposes SSR runtime configuration', () => {
  const compose = readProjectFile('docker-compose.ssr.yml');

  assert.match(compose, /image: "\$\{DOCKERHUB_USERNAME:\?set DOCKERHUB_USERNAME\}\/onlinejudge3-ssr:\$\{SSR_IMAGE_TAG:-latest\}"/);
  assert.match(compose, /NODE_WORKERS: "\$\{NODE_WORKERS:-1\}"/);
  assert.match(compose, /SSR_API_BASE_URL: "\$\{SSR_API_BASE_URL:\?set SSR_API_BASE_URL\}"/);
  assert.match(compose, /SSR_CACHE_REDIS_URL: "\$\{SSR_CACHE_REDIS_URL:-redis:\/\/redis:6379\}"/);
});
