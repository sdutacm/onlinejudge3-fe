/* eslint-disable func-name-matching */
/* eslint-disable @typescript-eslint/no-require-imports */
// 上传产物到腾讯云 COS

const fs = require('fs');
const pathLib = require('path');
const { promisify } = require('util');
const COS = require('cos-nodejs-sdk-v5');

const readdir = promisify(fs.readdir);
const stat = promisify(fs.stat);

const cos = new COS({
  SecretId: process.env.COS_SECRET_ID,
  SecretKey: process.env.COS_SECRET_KEY,
  Domain: process.env.COS_DOMAIN,
});

const Bucket = process.env.COS_BUCKET;
const Region = process.env.COS_REGION;

const SLICE_SIZE = 1024 * 1024;
const MAX_FILE_COUNT = 1000000;
const LIST_CONCURRENCY = 16;
const UPLOAD_CONCURRENCY = 3;
const MAX_UPLOAD_RETRIES = 3;
const RETRY_DELAY_MS = 1000;

const publicDir = process.argv[2] || 'onlinejudge3';
const cosTargetBase = process.env.COS_TARGET_BASE || ''; // should end with /
const localFolder = pathLib.join('.', publicDir);
const remotePrefix = `${cosTargetBase}${publicDir}/`;

function delay(ms) {
  if (!ms) return Promise.resolve();
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function formatError(error) {
  if (!error) return 'Unknown error';
  if (error.message) return error.message;
  try {
    return JSON.stringify(error);
  } catch (e) {
    return String(error);
  }
}

async function runWithConcurrency(items, concurrency, worker) {
  const results = new Array(items.length);
  let nextIndex = 0;
  const workerCount = Math.min(concurrency, items.length);

  async function runNext() {
    while (nextIndex < items.length) {
      const currentIndex = nextIndex;
      nextIndex += 1;
      results[currentIndex] = await worker(items[currentIndex], currentIndex);
    }
  }

  await Promise.all(Array.from({ length: workerCount }, runNext));
  return results;
}

async function listLocalFiles(rootPath) {
  const rootStat = await stat(rootPath);
  if (!rootStat.isDirectory()) {
    throw new Error(`Local path is not a directory: ${rootPath}`);
  }

  async function walk(dir) {
    const names = await readdir(dir);
    const entries = await runWithConcurrency(names, LIST_CONCURRENCY, async function(name) {
      const filePath = pathLib.join(dir, name);
      const fileStat = await stat(filePath);
      return {
        filePath,
        isDirectory: fileStat.isDirectory(),
        isFile: fileStat.isFile(),
        size: fileStat.size,
      };
    });

    let files = [];
    for (const entry of entries) {
      if (entry.isDirectory) {
        files = files.concat(await walk(entry.filePath));
      } else if (entry.isFile) {
        files.push({
          path: entry.filePath,
          size: entry.size,
        });
      }
    }
    return files;
  }

  const files = await walk(rootPath);
  if (files.length > MAX_FILE_COUNT) {
    throw new Error(`Too many files to upload: ${files.length}`);
  }
  return files;
}

function buildUploadFiles(localFiles) {
  return localFiles.map(function(file) {
    const filename = pathLib.relative(localFolder, file.path).replace(/\\/g, '/');
    return {
      Bucket,
      Region,
      Key: remotePrefix + filename,
      FilePath: file.path,
      Size: file.size,
    };
  });
}

function splitIndexFile(files) {
  const indexFile = files.find((file) => file.Key.endsWith('index.html'));
  if (!indexFile) {
    return {
      normalFiles: files,
      indexFile: null,
    };
  }

  return {
    normalFiles: files.filter((file) => file.Key !== indexFile.Key),
    indexFile,
  };
}

async function uploadFileOnce(file, attempt, totalAttempts) {
  let lastProgressLogAt = 0;
  await cos.uploadFile({
    Bucket: file.Bucket,
    Region: file.Region,
    Key: file.Key,
    FilePath: file.FilePath,
    SliceSize: SLICE_SIZE,
    onProgress: function(info) {
      const now = Date.now();
      if (now - lastProgressLogAt < 1000 && info.percent < 1) return;
      lastProgressLogAt = now;

      const percent = Math.floor(info.percent * 10000) / 100;
      const speed = Math.floor((info.speed / 1024 / 1024) * 100) / 100;
      console.log(
        `${file.Key} progress: ${percent}%; speed: ${speed}Mb/s; attempt: ${attempt}/${totalAttempts}`,
      );
    },
  });
}

async function uploadFileWithRetry(file) {
  const totalAttempts = MAX_UPLOAD_RETRIES + 1;
  let lastError = null;

  for (let attempt = 1; attempt <= totalAttempts; attempt += 1) {
    try {
      console.log(`${file.Key} upload start; attempt: ${attempt}/${totalAttempts}`);
      await uploadFileOnce(file, attempt, totalAttempts);
      console.log(`${file.Key} upload success; attempt: ${attempt}/${totalAttempts}`);
      return;
    } catch (error) {
      lastError = error;
      console.error(`${file.Key} upload failed; attempt: ${attempt}/${totalAttempts}: ${formatError(error)}`);

      if (attempt < totalAttempts) {
        console.log(`${file.Key} retrying; retry: ${attempt}/${MAX_UPLOAD_RETRIES}`);
        await delay(RETRY_DELAY_MS * attempt);
      }
    }
  }

  const error = new Error(`${file.Key} failed after ${totalAttempts} attempts: ${formatError(lastError)}`);
  error.cause = lastError;
  throw error;
}

async function uploadFiles(files, concurrency) {
  if (!files.length) return;

  const failures = [];
  await runWithConcurrency(files, concurrency, async function(file) {
    try {
      await uploadFileWithRetry(file);
    } catch (error) {
      failures.push({ file, error });
    }
  });

  if (failures.length) {
    const detail = failures
      .map((failure) => `${failure.file.Key}: ${formatError(failure.error)}`)
      .join('\n');
    const error = new Error(`Upload failed for ${failures.length}/${files.length} files:\n${detail}`);
    error.failures = failures;
    throw error;
  }
}

async function main() {
  console.log('Using public dir:', publicDir);
  console.log('Using upload concurrency:', UPLOAD_CONCURRENCY);
  console.log('Using upload retries:', MAX_UPLOAD_RETRIES);

  const localFiles = await listLocalFiles(localFolder);
  const files = buildUploadFiles(localFiles);

  if (!files.length) {
    throw new Error(`No files found to upload in ${localFolder}`);
  }

  console.log('to upload files:');
  files.forEach(function(file) {
    console.log(file.FilePath);
  });

  const { normalFiles, indexFile } = splitIndexFile(files);
  await uploadFiles(normalFiles, UPLOAD_CONCURRENCY);

  // index.html 最后上传，避免入口文件先更新后引用到尚未上传完成的静态资源。
  if (indexFile) {
    await uploadFiles([indexFile], 1);
  }
}

main()
  .then(function() {
    console.log('Upload CDN success.');
  })
  .catch(function(error) {
    console.error('Upload CDN failed:');
    console.error(error && error.stack ? error.stack : error);
    process.exit(1);
  });
