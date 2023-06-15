/**
 * @typedef {import('../../interceptors').default} Interceptors
 * ---
 * @typedef CommonThrottleOption
 * @property {string} notInterceptKey
 * ---
 * @typedef RequestInfo
 * @property {string} url
 * @property {RequestInit} init
 * @property {number} requestId private param
 * @property {AbortController} [_controller] private param
 * ---
 * @callback FilterFunc
 * @param {RequestInfo} currentConfig
 * @param {RequestInfo} storedConfig
 * @returns {boolean}
 */

/**
 * 在一个请求发起后未返回时，忽略之后发起的相同请求
 * set config.notThrottle = true 时则不拦截
 * @param {FilterFunc} [throttleFilter]
 * @param {CommonThrottleOption} [option]
 * @return {{install(interceptors:Interceptors):void}}
 */
export default function commonThrottleRequest(throttleFilter, option) {
  const assignedOption = Object.assign(
    {
      notInterceptKey: 'notThrottle',
    },
    option,
  );
  if (!throttleFilter && typeof throttleFilter !== 'function') {
    throttleFilter = (currentConfig, storedConfig) =>
      currentConfig.url === storedConfig.url && currentConfig.init.method === storedConfig.init.method;
  }

  return {
    install(interceptors) {
      let requestId = 1;
      /** @type {(RequestInfo | null)[]} 保存*/
      let cacheArr = [];
      /**@type {(init:any) => void} */
      let cacheArr_clean = init => {
        // 请求已返回则移除保存
        for (let i = 0; i < cacheArr.length; i++) {
          if (cacheArr[i]?.requestId === init._commonThrottleRequest?.requestId) {
            cacheArr[i] = null;
            break;
          }
        }
        if (cacheArr.length > 20) {
          cacheArr = cacheArr.filter(Boolean);
        }
      };

      interceptors.request.use(
        (url, init) => {
          if (init[assignedOption.notInterceptKey]) return init;
          requestId++;
          const storeObj = { requestId, url, init };
          init._commonThrottleRequest = { requestId };
          let hasRequestStored = false;

          let emptyIndex = cacheArr.length; // cacheArr 中空位的index

          for (let i = 0; i < cacheArr.length; i++) {
            const storedConfig = cacheArr[i];
            if (!storedConfig) {
              emptyIndex = i;
              continue;
            }
            if (throttleFilter?.({ url, init, requestId }, storedConfig)) {
              hasRequestStored = true;
              throw new Error('commonThrottleRequest: The request has been send but not received.Request has been ignore');
            }
          }

          if (!hasRequestStored) {
            cacheArr[emptyIndex] = storeObj;
          }
          return init;
        },
        err => {
          if (err.init) cacheArr_clean(err.init);
          return Promise.reject(err);
        },
      );

      interceptors.response.use(
        (data, { init }) => {
          cacheArr_clean(init);
          return data;
        },
        err => {
          if (err.init) cacheArr_clean(err.init);
          return Promise.reject(err);
        },
      );
    },
  };
}
