'use strict';

function getSSRRenderPath(ctx) {
  if (ctx && ctx.originalUrl) {
    return ctx.originalUrl;
  }
  if (ctx && ctx.url) {
    return ctx.url;
  }
  if (ctx && ctx.path) {
    return ctx.path;
  }
  return '/';
}

module.exports = {
  getSSRRenderPath: getSSRRenderPath,
};
