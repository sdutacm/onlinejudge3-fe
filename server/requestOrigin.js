'use strict';

function firstHeaderValue(value) {
  if (Array.isArray(value)) {
    value = value[0];
  }
  if (!value) {
    return '';
  }
  return String(value).split(',')[0].trim();
}

function getRequestOrigin(ctx, fallbackPort) {
  var headers = (ctx && ctx.headers) || {};
  var forwardedProtocol = firstHeaderValue(headers['x-forwarded-proto']);
  var forwardedHost = firstHeaderValue(headers['x-forwarded-host']);
  if (forwardedProtocol || forwardedHost) {
    return (
      (forwardedProtocol ||
        (ctx && ctx.protocol) ||
        (ctx && ctx.secure ? 'https' : 'http')) +
      '://' +
      (forwardedHost ||
        firstHeaderValue(headers.host) ||
        (ctx && ctx.host) ||
        '127.0.0.1:' + (fallbackPort || 80))
    );
  }

  if (ctx && ctx.origin) {
    return ctx.origin;
  }

  var protocol =
    (ctx && ctx.protocol) ||
    (ctx && ctx.secure ? 'https' : 'http');
  var host =
    firstHeaderValue(headers.host) ||
    (ctx && ctx.host) ||
    '127.0.0.1:' + (fallbackPort || 80);

  return protocol + '://' + host;
}

module.exports = {
  getRequestOrigin: getRequestOrigin,
};
