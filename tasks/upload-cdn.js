/* eslint-disable func-name-matching */
/* eslint-disable @typescript-eslint/no-require-imports */
// 上传产物到腾讯云 COS

const fs = require('fs');
const pathLib = require('path');
const Batch = require('batch');
const COS = require('cos-nodejs-sdk-v5');
const Async = require('cos-nodejs-sdk-v5/sdk/async');

const cos = new COS({
  SecretId: process.env.COS_SECRET_ID,
  SecretKey: process.env.COS_SECRET_KEY,
});

const Bucket = process.env.COS_BUCKET;
const Region = process.env.COS_REGION;


const publicDir = process.argv[2] || 'onlinejudge3';
console.log('Using public dir:', publicDir);
const cosTargetBase = process.env.COS_TARGET_BASE || ''; // should end with /
const localFolder = `./${publicDir}/`;
const remotePrefix = `${cosTargetBase}${publicDir}/`;

const fastListFolder = function(options, callback) {
  const pathJoin = function(dir, name, isDir) {
    dir = dir.replace(/\\/g, '/');
    const sep = dir.endsWith('/') ? '' : '/';
    let p = dir + sep + name;
    p = p.replace(/\\/g, '/');
    isDir && name && (p += '/');
    return p;
  };

  const readdir = function stat(dir, cb) {
    if (!dir || !cb) throw new Error('stat(dir, cb[, concurrency])');
    fs.readdir(dir, function(err, files) {
      if (err) return cb(err);
      const batch = new Batch();
      batch.concurrency(16);
      files.forEach(function(file) {
        const filePath = pathJoin(dir, file);
        batch.push(function(done) {
          fs.stat(filePath, done);
        });
      });
      batch.end(function(err, stats) {
        if (err) {
          console.log('readdir error:', err);
          cb(err);
          return;
        }
        stats.forEach(function(stat, i) {
          stat.isDir = stat.isDirectory();
          stat.path = pathJoin(dir, files[i], stat.isDir);
          stat.isDir && (stat.size = 0);
        });
        cb(err, stats);
      });
    });
  };

  const statFormat = function(stat) {
    return {
      path: stat.path,
      size: stat.size,
      isDir: stat.isDir,
    };
  };

  if (typeof options !== 'object') options = { path: options };
  const rootPath = options.path;
  let list = [];
  const _callback = function(err) {
    if (err) {
      callback(err);
    } else if (list.length > 1000000) {
      callback(window.lang.t('error.too_much_files'));
    } else {
      callback(null, list);
    }
  };
  const deep = function(dirStat, deepNext) {
    list.push(statFormat(dirStat));
    readdir(dirStat.path, function(err, files) {
      if (err) return deepNext();
      const dirList = files.filter((file) => file.isDir);
      const fileList = files.filter((file) => !file.isDir);
      list = [].concat(list, fileList.map(statFormat));
      Async.eachLimit(dirList, 1, deep, deepNext);
    });
  };
  fs.stat(rootPath, function(err, stat) {
    if (err) return _callback();
    stat.isDir = true;
    stat.path = pathJoin(rootPath, '', true);
    stat.isDir && (stat.size = 0);
    deep(stat, _callback);
  });
};

fastListFolder(localFolder, function(err, list) {
  if (err) return console.error(err);
  let files = list.map(function(file) {
    let filename = pathLib.relative(localFolder, file.path).replace(/\\/g, '/');
    if (filename && file.isDir && !filename.endsWith('/')) filename += '/';
    const Key = remotePrefix + filename;
    return {
      Bucket,
      Region,
      Key,
      FilePath: file.path,
    };
  });
  // 移动 index.html 到最后上传
  const indexFile = files.find((file) => file.Key.endsWith('index.html'));
  if (indexFile) {
    files = files.filter((file) => file.Key !== indexFile.Key);
    files.push(indexFile);
  }
  console.log('to upload files:');
  files.forEach(function(file) {
    console.log(file.FilePath);
  });
  cos.uploadFiles(
    {
      files: files,
      SliceSize: 1024 * 1024,
      onProgress: function(info) {
        const percent = Math.floor(info.percent * 10000) / 100;
        const speed = Math.floor((info.speed / 1024 / 1024) * 100) / 100;
        console.log('progress: ' + percent + '%; speed: ' + speed + 'Mb/s');
      },
      onFileFinish: function(err, data, options) {
        console.log(options.Key + ' upload ' + (err ? 'failed' : 'success'));
        if (err) {
          // 有文件上传失败时不会进入到最终的回调 err，只能在此直接退出
          process.exit(1);
        }
      },
    },
    function(err, data) {
      if (err) {
        console.log('error:', err);
        process.exit(1);
      }
      process.exit(0);
    },
  );
});
