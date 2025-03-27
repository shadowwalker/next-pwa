// fallback.js
'use strict';

self.fallback = async request => {
  // 参考：https://developer.mozilla.org/en-US/docs/Web/API/RequestDestination
  switch (request.destination) {
    case 'document': {
      if (process.env.__PWA_FALLBACK_DOCUMENT__) {
        return caches.match(process.env.__PWA_FALLBACK_DOCUMENT__, { ignoreSearch: true });
      }
      break;
    }
    case 'image': {
      if (process.env.__PWA_FALLBACK_IMAGE__) {
        return caches.match(process.env.__PWA_FALLBACK_IMAGE__, { ignoreSearch: true });
      }
      break;
    }
    case 'audio': {
      if (process.env.__PWA_FALLBACK_AUDIO__) {
        return caches.match(process.env.__PWA_FALLBACK_AUDIO__, { ignoreSearch: true });
      }
      break;
    }
    case 'video': {
      if (process.env.__PWA_FALLBACK_VIDEO__) {
        return caches.match(process.env.__PWA_FALLBACK_VIDEO__, { ignoreSearch: true });
      }
      break;
    }
    case 'font': {
      if (process.env.__PWA_FALLBACK_FONT__) {
        return caches.match(process.env.__PWA_FALLBACK_FONT__, { ignoreSearch: true });
      }
      break;
    }
    case '': {
      // 针对 Next.js 数据文件：/_next/data/{id}/...json
      if (process.env.__PWA_FALLBACK_DATA__ && request.url.match(/\/_next\/data\/.+\/.+\.json$/i)) {
        return caches.match(process.env.__PWA_FALLBACK_DATA__, { ignoreSearch: true });
      }
      break;
    }
    default:
      break;
  }
  return Response.error();
};
