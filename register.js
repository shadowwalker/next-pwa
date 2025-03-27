// register.js
import { Workbox } from 'workbox-window';

// 仅在浏览器环境且支持 Service Worker 和 Cache API 时执行
if (typeof window !== 'undefined' && 'serviceWorker' in navigator && typeof caches !== 'undefined') {
  /**
   * Helper: 确保起始 URL 已缓存
   * 使用 caches.has 兼容性检测，若不存在则使用 caches.keys() 判断缓存是否存在
   */
  const ensureStartUrlCached = async () => {
    if (!__PWA_START_URL__) return;
    try {
      const cacheName = 'start-url';
      const cacheExists = typeof caches.has === 'function'
        ? await caches.has(cacheName)
        : (await caches.keys()).includes(cacheName);
      if (!cacheExists) {
        const cache = await caches.open(cacheName);
        await cache.put(__PWA_START_URL__, new Response('', { status: 200 }));
      }
    } catch (err) {
      console.error('Error ensuring start URL is cached:', err);
    }
  };

  // 立即调用一次确保起始 URL 被缓存
  ensureStartUrlCached();

  /**
   * Helper: 根据 URL 缓存资源，并处理重定向情况
   */
  const cacheResource = async (url, cacheName) => {
    try {
      const cache = await caches.open(cacheName);
      const response = await fetch(url);
      if (response.redirected) {
        // 如果有重定向，重新构造响应以确保状态为 200
        const newResponse = new Response(response.body, {
          status: 200,
          statusText: 'OK',
          headers: response.headers,
        });
        await cache.put(url, newResponse);
      } else {
        await cache.put(url, response.clone());
      }
    } catch (err) {
      console.error(`Error caching resource ${url} in cache ${cacheName}:`, err);
    }
  };

  /**
   * Helper: 缓存 Next.js 数据（例如 /_next/data/.../*.json）
   */
  const cacheNextData = async () => {
    try {
      const resources = window.performance.getEntriesByType('resource')
        .map(e => e.name)
        .filter(name => name.startsWith(`${window.location.origin}/_next/data/`) && name.endsWith('.json'));
      const dataCache = await caches.open('next-data');
      await Promise.all(resources.map(url => dataCache.add(url)));
    } catch (err) {
      console.error('Error caching Next.js data:', err);
    }
  };

  // 创建 Workbox 实例
  const wb = new Workbox(window.location.origin + __PWA_SW__, { scope: __PWA_SCOPE__ });

  // 监听 SW 安装事件
  wb.addEventListener('installed', async (event) => {
    if (!event.isUpdate) {
      // 首次安装时，缓存起始 URL 和 Next.js 数据文件
      if (__PWA_START_URL__) {
        await cacheResource(__PWA_START_URL__, 'start-url');
      }
      await cacheNextData();
    }
  });

  // 监听 SW waiting 事件
  wb.addEventListener('waiting', () => {
    console.log('A new service worker is waiting to activate.');
  });

  // 监听 SW 激活事件
  wb.addEventListener('activated', async (event) => {
    if (!event.isUpdate && __PWA_START_URL__) {
      await cacheResource(__PWA_START_URL__, 'start-url');
    }
  });

  // 监听 SW 消息事件，提示缓存更新
  wb.addEventListener('message', event => {
    if (event.data && event.data.type === 'CACHE_UPDATED') {
      const { updatedURL } = event.data.payload;
      console.log(`A newer version of ${updatedURL} is available!`);
    }
  });

  // 如果启用了自动注册，则注册 Service Worker
  if (__PWA_ENABLE_REGISTER__) {
    wb.register();
  }

  // 前端导航缓存逻辑：仅在显式开启时 (__PWA_CACHE_ON_FRONT_END_NAV__) 执行历史 API 重写
  if (__PWA_CACHE_ON_FRONT_END_NAV__) {
    /**
     * Helper: 根据传入 URL 缓存资源
     */
    const cacheOnNavigation = async (url) => {
      if (!navigator.onLine) return;
      try {
        // 针对非起始 URL 进行缓存
        if (url !== __PWA_START_URL__) {
          const cache = await caches.open('others');
          const match = await cache.match(url, { ignoreSearch: true });
          if (!match) {
            await cache.add(url);
          }
        } else if (__PWA_START_URL__ && url === __PWA_START_URL__) {
          await cacheResource(__PWA_START_URL__, 'start-url');
        }
      } catch (err) {
        console.error(`Error caching navigation resource ${url}:`, err);
      }
    };

    // 重写 history.pushState 与 history.replaceState 方法，加入缓存逻辑
    try {
      const originalPushState = history.pushState;
      history.pushState = function (...args) {
        originalPushState.apply(history, args);
        // args[2] 为新 URL，加入缓存逻辑
        cacheOnNavigation(args[2]);
      };

      const originalReplaceState = history.replaceState;
      history.replaceState = function (...args) {
        originalReplaceState.apply(history, args);
        cacheOnNavigation(args[2]);
      };
    } catch (err) {
      console.error('Error overriding history API for caching navigation:', err);
    }
  }

  // 针对起始 URL，单独添加在线事件监听（与导航缓存逻辑无关）
  if (__PWA_START_URL__) {
    window.addEventListener('online', () => {
      // 当网络恢复时，缓存当前页面
      cacheResource(__PWA_START_URL__, 'start-url');
    });
  }

  // 在线重载逻辑
  if (__PWA_RELOAD_ON_ONLINE__) {
    window.addEventListener('online', () => {
      // TODO: 可结合页面版本检测来判断是否需要重载，避免不必要的刷新
      location.reload();
    });
  }
}
