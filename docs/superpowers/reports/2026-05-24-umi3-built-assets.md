# Umi3 Built Asset Snapshot - 2026-05-24

Generated at: 2026-05-24T11:28:29.979Z

This is the forward-looking bundle baseline after the Umi 3 route-level dynamic import migration. It does not reconstruct the old Umi 2 baseline.

Analysis notes:

- `index.html` should only inject `umi.*.js`; large vendor chunks must stay behind route/runtime loaders.
- `Route Loader JS` is parsed from the Umi webpack runtime and excludes the initial `umi.*.js` unless shown in the `Initial + route` columns.
- Webpack `default~...` chunk names list every async route sharing that module set; these are shared modules, not full page entries.
- Excel export and rich-text editor dependencies are intentionally loaded from user-triggered async paths rather than initial route entrypoints.

## regular (onlinejudge3)

| Group | Count | Size | Gzip size |
| --- | --- | --- | --- |
| Initial JS | 1 | 986.0 KB | 285.0 KB |
| Async JS chunks | 95 | 9.46 MB | 2.67 MB |
| All JS | 96 | 10.43 MB | 2.95 MB |

### Initial JS

| File | Size | Gzip size |
| --- | --- | --- |
| umi.7773ac93.js | 986.0 KB | 285.0 KB |

### Key Route Chunks

| File | Size | Gzip size |
| --- | --- | --- |
| p__index.2b349303.async.js | 10.6 KB | 4.0 KB |
| p__problems__$id.7067154f.async.js | 116.1 KB | 33.8 KB |
| p__contests__$id__ranklist.f872b4ba.async.js | 34.2 KB | 10.4 KB |

### Route Loader JS

| Route | Count | Route JS | Route gzip | Initial + route JS | Initial + route gzip |
| --- | --- | --- | --- | --- | --- |
| /onlinejudge3/ | 17 | 1.20 MB | 331.2 KB | 2.16 MB | 616.2 KB |
| /onlinejudge3/problems/1000 | 18 | 1.55 MB | 432.0 KB | 2.51 MB | 717.0 KB |
| /onlinejudge3/contests/1/ranklist | 18 | 1.24 MB | 343.6 KB | 2.20 MB | 628.7 KB |
| /onlinejudge3/competitions/1/overview | 18 | 1.45 MB | 398.8 KB | 2.42 MB | 683.9 KB |

#### /onlinejudge3/

| File | Size | Gzip size |
| --- | --- | --- |
| ui.01ec4c74.async.js | 404.7 KB | 90.2 KB |
| raincloud.a8a67025.async.js | 159.9 KB | 47.2 KB |
| time-is-money.60ab1227.async.js | 120.3 KB | 37.7 KB |
| default~layouts__index~p__OJBK~p__admin___layout~p__admin__competitions__index~p__admin__contests__$~a73fa2a8.7af04196.async.js | 33.7 KB | 11.1 KB |
| default~layouts__index~p__OJBK~p__admin___layout~p__admin__competitions__index~p__admin__contests__$~34de0632.9f9540bc.async.js | 23.9 KB | 7.8 KB |
| default~layouts__index~p__admin__competitions__index~p__admin__contests__$id__problems~p__admin__con~7142620d.eb4755b8.async.js | 49.1 KB | 14.9 KB |
| default~layouts__index~p__OJBK~p__admin__competitions__index~p__admin__contests__$id__problems~p__ad~2184f1a8.cb85ad31.async.js | 9.6 KB | 3.1 KB |
| default~layouts__index~p__OJBK~p__admin__competitions__index~p__admin__contests__$id__problems~p__ad~d6785576.2a8d1962.async.js | 10.4 KB | 4.0 KB |
| default~layouts__index~p__admin__competitions__index~p__admin__contests__$id__problems~p__admin__con~1b6a14eb.efd24b07.async.js | 89.3 KB | 23.5 KB |
| default~layouts__index~p__OJBK~p__admin__competitions__index~p__admin__contests__$id__problems~p__ad~b9884f60.14dee90e.async.js | 5.6 KB | 2.1 KB |
| default~layouts__index~p__admin__competitions__index~p__admin__contests__$id__problems~p__admin__con~48313a9a.ed1489e5.async.js | 15.3 KB | 4.7 KB |
| default~layouts__index~p__OJBK~p__admin__competitions__index~p__admin__contests__$id__problems~p__ad~ee2cd57e.7fe72c34.async.js | 38.6 KB | 10.2 KB |
| default~layouts__index~p__competitions-public__$id__intro~p__contests__$id__overview~p__messages__in~2bf668bc.fd26739a.async.js | 18.5 KB | 6.3 KB |
| layouts__index.759ffdc9.async.js | 174.5 KB | 47.1 KB |
| default~p__admin__competitions__index~p__admin__contests__$id__problems~p__admin__contests__$id__use~36994651.91cc87ed.async.js | 19.6 KB | 5.8 KB |
| default~p__admin__competitions__index~p__admin__contests__$id__problems~p__admin__contests__index~p_~a23be438.31d0392e.async.js | 42.1 KB | 11.5 KB |
| p__index.2b349303.async.js | 10.6 KB | 4.0 KB |

#### /onlinejudge3/problems/1000

| File | Size | Gzip size |
| --- | --- | --- |
| ui.01ec4c74.async.js | 404.7 KB | 90.2 KB |
| raincloud.a8a67025.async.js | 159.9 KB | 47.2 KB |
| time-is-money.60ab1227.async.js | 120.3 KB | 37.7 KB |
| default~layouts__index~p__OJBK~p__admin___layout~p__admin__competitions__index~p__admin__contests__$~a73fa2a8.7af04196.async.js | 33.7 KB | 11.1 KB |
| default~layouts__index~p__OJBK~p__admin___layout~p__admin__competitions__index~p__admin__contests__$~34de0632.9f9540bc.async.js | 23.9 KB | 7.8 KB |
| default~layouts__index~p__admin__competitions__index~p__admin__contests__$id__problems~p__admin__con~7142620d.eb4755b8.async.js | 49.1 KB | 14.9 KB |
| default~layouts__index~p__OJBK~p__admin__competitions__index~p__admin__contests__$id__problems~p__ad~2184f1a8.cb85ad31.async.js | 9.6 KB | 3.1 KB |
| default~layouts__index~p__OJBK~p__admin__competitions__index~p__admin__contests__$id__problems~p__ad~d6785576.2a8d1962.async.js | 10.4 KB | 4.0 KB |
| default~layouts__index~p__admin__competitions__index~p__admin__contests__$id__problems~p__admin__con~1b6a14eb.efd24b07.async.js | 89.3 KB | 23.5 KB |
| default~layouts__index~p__OJBK~p__admin__competitions__index~p__admin__contests__$id__problems~p__ad~b9884f60.14dee90e.async.js | 5.6 KB | 2.1 KB |
| default~layouts__index~p__admin__competitions__index~p__admin__contests__$id__problems~p__admin__con~48313a9a.ed1489e5.async.js | 15.3 KB | 4.7 KB |
| default~layouts__index~p__OJBK~p__admin__competitions__index~p__admin__contests__$id__problems~p__ad~ee2cd57e.7fe72c34.async.js | 38.6 KB | 10.2 KB |
| default~layouts__index~p__competitions-public__$id__intro~p__contests__$id__overview~p__messages__in~2bf668bc.fd26739a.async.js | 18.5 KB | 6.3 KB |
| layouts__index.759ffdc9.async.js | 174.5 KB | 47.1 KB |
| mathematics-is-the-queen-of-the-sciences.b734715f.async.js | 276.5 KB | 76.2 KB |
| default~p__admin__competitions__index~p__admin__contests__$id__problems~p__admin__contests__$id__use~36994651.91cc87ed.async.js | 19.6 KB | 5.8 KB |
| default~p__competitions__$id__problems__$alias~p__competitions__$id__solutions__$sid~p__contests__$i~843b2821.719475db.async.js | 19.1 KB | 6.4 KB |
| p__problems__$id.7067154f.async.js | 116.1 KB | 33.8 KB |

#### /onlinejudge3/contests/1/ranklist

| File | Size | Gzip size |
| --- | --- | --- |
| ui.01ec4c74.async.js | 404.7 KB | 90.2 KB |
| raincloud.a8a67025.async.js | 159.9 KB | 47.2 KB |
| time-is-money.60ab1227.async.js | 120.3 KB | 37.7 KB |
| default~layouts__index~p__OJBK~p__admin___layout~p__admin__competitions__index~p__admin__contests__$~a73fa2a8.7af04196.async.js | 33.7 KB | 11.1 KB |
| default~layouts__index~p__OJBK~p__admin___layout~p__admin__competitions__index~p__admin__contests__$~34de0632.9f9540bc.async.js | 23.9 KB | 7.8 KB |
| default~layouts__index~p__admin__competitions__index~p__admin__contests__$id__problems~p__admin__con~7142620d.eb4755b8.async.js | 49.1 KB | 14.9 KB |
| default~layouts__index~p__OJBK~p__admin__competitions__index~p__admin__contests__$id__problems~p__ad~2184f1a8.cb85ad31.async.js | 9.6 KB | 3.1 KB |
| default~layouts__index~p__OJBK~p__admin__competitions__index~p__admin__contests__$id__problems~p__ad~d6785576.2a8d1962.async.js | 10.4 KB | 4.0 KB |
| default~layouts__index~p__admin__competitions__index~p__admin__contests__$id__problems~p__admin__con~1b6a14eb.efd24b07.async.js | 89.3 KB | 23.5 KB |
| default~layouts__index~p__OJBK~p__admin__competitions__index~p__admin__contests__$id__problems~p__ad~b9884f60.14dee90e.async.js | 5.6 KB | 2.1 KB |
| default~layouts__index~p__admin__competitions__index~p__admin__contests__$id__problems~p__admin__con~48313a9a.ed1489e5.async.js | 15.3 KB | 4.7 KB |
| default~layouts__index~p__OJBK~p__admin__competitions__index~p__admin__contests__$id__problems~p__ad~ee2cd57e.7fe72c34.async.js | 38.6 KB | 10.2 KB |
| default~layouts__index~p__competitions-public__$id__intro~p__contests__$id__overview~p__messages__in~2bf668bc.fd26739a.async.js | 18.5 KB | 6.3 KB |
| layouts__index.759ffdc9.async.js | 174.5 KB | 47.1 KB |
| p__contests__$id___layout.1db53870.async.js | 19.0 KB | 6.1 KB |
| default~p__admin__competitions__index~p__admin__contests__$id__problems~p__admin__contests__$id__use~36994651.91cc87ed.async.js | 19.6 KB | 5.8 KB |
| default~p__admin__competitions__index~p__admin__contests__$id__problems~p__admin__contests__index~p_~a23be438.31d0392e.async.js | 42.1 KB | 11.5 KB |
| p__contests__$id__ranklist.f872b4ba.async.js | 34.2 KB | 10.4 KB |

#### /onlinejudge3/competitions/1/overview

| File | Size | Gzip size |
| --- | --- | --- |
| ui.01ec4c74.async.js | 404.7 KB | 90.2 KB |
| raincloud.a8a67025.async.js | 159.9 KB | 47.2 KB |
| time-is-money.60ab1227.async.js | 120.3 KB | 37.7 KB |
| default~layouts__index~p__OJBK~p__admin___layout~p__admin__competitions__index~p__admin__contests__$~a73fa2a8.7af04196.async.js | 33.7 KB | 11.1 KB |
| default~layouts__index~p__OJBK~p__admin___layout~p__admin__competitions__index~p__admin__contests__$~34de0632.9f9540bc.async.js | 23.9 KB | 7.8 KB |
| default~layouts__index~p__admin__competitions__index~p__admin__contests__$id__problems~p__admin__con~7142620d.eb4755b8.async.js | 49.1 KB | 14.9 KB |
| default~layouts__index~p__OJBK~p__admin__competitions__index~p__admin__contests__$id__problems~p__ad~2184f1a8.cb85ad31.async.js | 9.6 KB | 3.1 KB |
| default~layouts__index~p__OJBK~p__admin__competitions__index~p__admin__contests__$id__problems~p__ad~d6785576.2a8d1962.async.js | 10.4 KB | 4.0 KB |
| default~layouts__index~p__admin__competitions__index~p__admin__contests__$id__problems~p__admin__con~1b6a14eb.efd24b07.async.js | 89.3 KB | 23.5 KB |
| default~layouts__index~p__OJBK~p__admin__competitions__index~p__admin__contests__$id__problems~p__ad~b9884f60.14dee90e.async.js | 5.6 KB | 2.1 KB |
| default~layouts__index~p__admin__competitions__index~p__admin__contests__$id__problems~p__admin__con~48313a9a.ed1489e5.async.js | 15.3 KB | 4.7 KB |
| default~layouts__index~p__OJBK~p__admin__competitions__index~p__admin__contests__$id__problems~p__ad~ee2cd57e.7fe72c34.async.js | 38.6 KB | 10.2 KB |
| default~layouts__index~p__competitions-public__$id__intro~p__contests__$id__overview~p__messages__in~2bf668bc.fd26739a.async.js | 18.5 KB | 6.3 KB |
| layouts__index.759ffdc9.async.js | 174.5 KB | 47.1 KB |
| p__competitions__$id___layout.74d31bcb.async.js | 63.1 KB | 17.7 KB |
| default~p__admin__competitions__index~p__admin__contests__$id__problems~p__admin__contests__$id__use~36994651.91cc87ed.async.js | 19.6 KB | 5.8 KB |
| default~p__admin__competitions__index~p__admin__contests__$id__problems~p__admin__contests__index~p_~a23be438.31d0392e.async.js | 42.1 KB | 11.5 KB |
| p__competitions__$id__overview.c0aaea5e.async.js | 210.4 KB | 53.9 KB |


## competition-side (onlinejudge3_cs)

| Group | Count | Size | Gzip size |
| --- | --- | --- | --- |
| Initial JS | 1 | 986.0 KB | 285.1 KB |
| Async JS chunks | 95 | 9.46 MB | 2.67 MB |
| All JS | 96 | 10.43 MB | 2.95 MB |

### Initial JS

| File | Size | Gzip size |
| --- | --- | --- |
| umi.b6d51fdc.js | 986.0 KB | 285.1 KB |

### Key Route Chunks

| File | Size | Gzip size |
| --- | --- | --- |
| p__competitions__$id__overview.107184e7.async.js | 210.5 KB | 54.0 KB |

### Route Loader JS

| Route | Count | Route JS | Route gzip | Initial + route JS | Initial + route gzip |
| --- | --- | --- | --- | --- | --- |
| /onlinejudge3_cs/competitions/1/overview | 18 | 1.45 MB | 398.8 KB | 2.42 MB | 683.9 KB |

#### /onlinejudge3_cs/competitions/1/overview

| File | Size | Gzip size |
| --- | --- | --- |
| ui.01ec4c74.async.js | 404.7 KB | 90.2 KB |
| raincloud.a8a67025.async.js | 159.9 KB | 47.2 KB |
| time-is-money.60ab1227.async.js | 120.3 KB | 37.7 KB |
| default~layouts__index~p__OJBK~p__admin___layout~p__admin__competitions__index~p__admin__contests__$~a73fa2a8.7af04196.async.js | 33.7 KB | 11.1 KB |
| default~layouts__index~p__OJBK~p__admin___layout~p__admin__competitions__index~p__admin__contests__$~34de0632.9f9540bc.async.js | 23.9 KB | 7.8 KB |
| default~layouts__index~p__admin__competitions__index~p__admin__contests__$id__problems~p__admin__con~7142620d.eb4755b8.async.js | 49.1 KB | 14.9 KB |
| default~layouts__index~p__OJBK~p__admin__competitions__index~p__admin__contests__$id__problems~p__ad~2184f1a8.cb85ad31.async.js | 9.6 KB | 3.1 KB |
| default~layouts__index~p__OJBK~p__admin__competitions__index~p__admin__contests__$id__problems~p__ad~d6785576.2a8d1962.async.js | 10.4 KB | 4.0 KB |
| default~layouts__index~p__admin__competitions__index~p__admin__contests__$id__problems~p__admin__con~1b6a14eb.efd24b07.async.js | 89.3 KB | 23.5 KB |
| default~layouts__index~p__OJBK~p__admin__competitions__index~p__admin__contests__$id__problems~p__ad~b9884f60.14dee90e.async.js | 5.6 KB | 2.1 KB |
| default~layouts__index~p__admin__competitions__index~p__admin__contests__$id__problems~p__admin__con~48313a9a.ed1489e5.async.js | 15.3 KB | 4.7 KB |
| default~layouts__index~p__OJBK~p__admin__competitions__index~p__admin__contests__$id__problems~p__ad~ee2cd57e.7fe72c34.async.js | 38.6 KB | 10.2 KB |
| default~layouts__index~p__competitions-public__$id__intro~p__contests__$id__overview~p__messages__in~2bf668bc.fd26739a.async.js | 18.5 KB | 6.3 KB |
| layouts__index.4d197b88.async.js | 174.5 KB | 47.1 KB |
| p__competitions__$id___layout.30ac8c28.async.js | 63.1 KB | 17.7 KB |
| default~p__admin__competitions__index~p__admin__contests__$id__problems~p__admin__contests__$id__use~36994651.91cc87ed.async.js | 19.6 KB | 5.8 KB |
| default~p__admin__competitions__index~p__admin__contests__$id__problems~p__admin__contests__index~p_~a23be438.31d0392e.async.js | 42.1 KB | 11.5 KB |
| p__competitions__$id__overview.107184e7.async.js | 210.5 KB | 54.0 KB |
