'use strict';

var http = require('http');
var https = require('https');

var HOP_BY_HOP_HEADERS = {
  connection: true,
  'keep-alive': true,
  'proxy-authenticate': true,
  'proxy-authorization': true,
  te: true,
  trailer: true,
  'transfer-encoding': true,
  upgrade: true,
};

function stripTrailingSlash(value) {
  return value && value.length > 1 && value.endsWith('/') ? value.slice(0, -1) : value;
}

function joinURLPath(basePath, nextPath) {
  var base = stripTrailingSlash(basePath || '');
  var next = nextPath.charAt(0) === '/' ? nextPath : '/' + nextPath;
  if (!base || base === '/') {
    return next;
  }
  return base + next;
}

function getAPIProxyTarget(originalUrl, base, upstreamBase) {
  if (!upstreamBase) {
    return null;
  }
  var parsed;
  try {
    parsed = new URL(originalUrl || '/', 'http://localhost');
  } catch (e) {
    return null;
  }

  var appBase = stripTrailingSlash(base || '');
  var apiPrefix = (appBase && appBase !== '/' ? appBase : '') + '/api';
  var pathname = parsed.pathname;
  if (pathname !== apiPrefix && pathname.indexOf(apiPrefix + '/') !== 0) {
    return null;
  }

  var upstream;
  try {
    upstream = new URL(upstreamBase);
  } catch (e) {
    return null;
  }
  var strippedPath = pathname.slice(apiPrefix.length) || '/';
  upstream.pathname = joinURLPath(upstream.pathname, strippedPath);
  upstream.search = parsed.search;
  return upstream.toString();
}

function filterRequestHeaders(headers, target) {
  var next = {};
  Object.keys(headers || {}).forEach(function (name) {
    if (!HOP_BY_HOP_HEADERS[name.toLowerCase()]) {
      next[name] = headers[name];
    }
  });
  next.host = target.host;
  return next;
}

function setResponseHeaders(ctx, headers) {
  Object.keys(headers || {}).forEach(function (name) {
    if (!HOP_BY_HOP_HEADERS[name.toLowerCase()]) {
      ctx.res.setHeader(name, headers[name]);
    }
  });
}

function proxyAPIRequest(ctx, targetUrl) {
  return new Promise(function (resolve, reject) {
    var target = new URL(targetUrl);
    var client = target.protocol === 'https:' ? https : http;
    var req = client.request(
      {
        protocol: target.protocol,
        hostname: target.hostname,
        port: target.port || undefined,
        method: ctx.method,
        path: target.pathname + target.search,
        headers: filterRequestHeaders(ctx.headers, target),
      },
      function (res) {
        ctx.respond = false;
        ctx.res.statusCode = res.statusCode || 502;
        setResponseHeaders(ctx, res.headers);
        res.pipe(ctx.res);
        res.on('end', resolve);
        res.on('error', reject);
      },
    );
    req.on('error', reject);
    ctx.req.pipe(req);
  });
}

module.exports = {
  getAPIProxyTarget: getAPIProxyTarget,
  proxyAPIRequest: proxyAPIRequest,
};
