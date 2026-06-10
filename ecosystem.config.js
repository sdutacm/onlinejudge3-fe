/**
 * pm2 deployment config for the SSR server.
 *
 * Multi-worker on a single machine via cluster mode (pm2 load-balances across
 * workers on the same port). Tune worker count with the NODE_WORKERS env var
 * (e.g. `NODE_WORKERS=4 pm2 start ecosystem.config.js`); defaults to 1 for
 * container-friendly foreground runs. SSR_WORKERS is kept as a legacy alias.
 *
 * Usage:
 *   OJ3_SSR=1 pnpm build:ssr           # produce dist incl. umi.server.js
 *   pm2 start ecosystem.config.js      # boot the cluster
 *   pm2 reload oj3-ssr                  # zero-downtime reload after a rebuild
 *   pm2 logs oj3-ssr                    # structured [SSR] logs
 */
module.exports = {
  apps: [
    {
      name: 'oj3-ssr',
      script: 'server/index.js',
      exec_mode: 'cluster',
      instances: process.env.NODE_WORKERS || process.env.SSR_WORKERS || 1,
      // Match the build toolchain's OpenSSL setting; harmless if unneeded.
      node_args: '--openssl-legacy-provider',
      max_memory_restart: process.env.SSR_MAX_MEMORY || '512M',
      merge_logs: true,
      time: true,
      out_file: process.env.PM2_OUT_FILE || 'logs/ssr-out.log',
      error_file: process.env.PM2_ERROR_FILE || 'logs/ssr-err.log',
      env: {
        NODE_ENV: 'production',
        SSR_PORT: process.env.SSR_PORT || 8102,
        OJ3_BASE: process.env.OJ3_BASE || '/onlinejudge3/',
        // Point at the real API origin so server-side prefetch can reach it:
        // SSR_API_BASE_URL: 'http://127.0.0.1:7001/onlinejudge3/api',
        // Optional URL-keyed cache: 'memory' | 'redis' | 'off'
        SSR_CACHE: process.env.SSR_CACHE || 'memory',
        SSR_CACHE_TTL_MS: process.env.SSR_CACHE_TTL_MS || 60000,
        // SSR_CACHE_REDIS_URL: 'redis://127.0.0.1:6379',
        SSR_RENDER_TIMEOUT_MS: process.env.SSR_RENDER_TIMEOUT_MS || 5000,
        SSR_LOG_LEVEL: process.env.SSR_LOG_LEVEL || 'info',
      },
      env_competition_side: {
        NODE_ENV: 'production',
        SSR_PORT: process.env.SSR_PORT || 8103,
        OJ3_BASE: '/onlinejudge3_cs/',
        SSR_CACHE: process.env.SSR_CACHE || 'memory',
      },
    },
  ],
};
