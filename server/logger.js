'use strict';

/**
 * Minimal structured logger for the SSR server. One line per request outcome so
 * it is greppable in pm2 logs. Levels respect SSR_LOG_LEVEL (debug|info|warn|error).
 */

var LEVELS = { debug: 10, info: 20, warn: 30, error: 40 };
var threshold = LEVELS[(process.env.SSR_LOG_LEVEL || 'info').toLowerCase()] || LEVELS.info;

function fmt(level, msg, fields) {
  var base = '[SSR][' + new Date().toISOString() + '][' + level + '] ' + msg;
  if (fields && Object.keys(fields).length) {
    try {
      base += ' ' + JSON.stringify(fields);
    } catch (e) {
      base += ' (unserializable fields)';
    }
  }
  return base;
}

function make(level, sink) {
  return function (msg, fields) {
    if (LEVELS[level] < threshold) {
      return;
    }
    // eslint-disable-next-line no-console
    sink(fmt(level, msg, fields));
  };
}

module.exports = {
  debug: make('debug', console.log),
  info: make('info', console.log),
  warn: make('warn', console.warn),
  error: make('error', console.error),
};
