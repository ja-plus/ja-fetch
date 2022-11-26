/**
 * @typedef {import('../../src/interceptors').default} Interceptors
 */
/**
 * @typedef CommonCancelOption
 * @property {string} notInterceptKey
 * @property {number} [gcCacheArrNum=20]
 */
/**
 * @typedef RequestInfo
 * @property {string} url
 * @property {RequestInit} init
 * @property {number} requestId private param
 * @property {AbortController} [_controller] private param
 */
/**
 * @callback FilterFunc
 * @param {RequestInfo} currentConfig
 * @param {RequestInfo} storedConfig
 * @returns {boolean}
 */

/**
 * 用AbortController 取消之前发起的相同的请求
 * set config.notCancel = true 时则不拦截
 * @param {FilterFunc} [abortFilter] default: url === url, method === method
 * @param {CommonCancelOption} [option]
 * @return {{install(interceptors:Interceptors):void}}
 */
export default function commonCancelRequest(abortFilter, option) {
  /** @type {CommonCancelOption} */
  const defaultOption = {
    notInterceptKey: 'notCancel',
    gcCacheArrNum: 20,
  };
  option = Object.assign({}, defaultOption, option || {});

  if (!abortFilter && typeof abortFilter !== 'function') {
    abortFilter = (currentConfig, storedConfig) => currentConfig.url === storedConfig.url && currentConfig.init.method === storedConfig.init.method;
  }

  return {
    install(interceptors) {
      /** @type {RequestInfo[]} */
      let cacheArr = [];
      let requestId = 1;
      interceptors.request.use(
        /**
         * request onFullfilled
         * @param {string} url
         * @param {RequestInit} init will pass to fetch
         * @returns
         */
        (url, init) => {
          if (init[option.notInterceptKey]) return init;
          requestId++;

          let hasPendingRequest = false;
          /**@type {RequestInfo} */
          let storedObj = { url, init, requestId };

          init._commonCancelRequest = {
            requestId,
          };

          if (window.AbortController) {
            const abController = new AbortController();
            init.signal = abController.signal;
            storedObj._controller = abController;
          } else {
            init._commonCancelRequest.canceled = false;
          }
          // check if has pending request
          for (let i = 0; i < cacheArr.length; i++) {
            const storedConfig = cacheArr[i];
            if (!storedConfig) continue;
            if (abortFilter({ url, init }, storedConfig)) {
              if (window.AbortController) {
                hasPendingRequest = true; // not push to cache
                storedConfig._controller?.abort(); // abort request
                cacheArr[i] = storedObj; // replace old cahce with new
              } else {
                // sign as cancelled，deal in response
                storedConfig.canceled = true;
              }
            }
          }

          // if not has pending request, add to cache
          if (!hasPendingRequest) {
            cacheArr.push(storedObj);
          }
          return init;
        },
      );

      interceptors.response.use((data, { url, init }) => {
        let isReject = false;
        let id = null;
        for (let i = 0; i < cacheArr.length; i++) {
          const item = cacheArr[i];
          if (!item) continue;
          if (item.requestId === init._commonCancelRequest?.requestId) {
            isReject = Boolean(item?.canceled);
            cacheArr[i] = null;
            id = item.requestId;
            break;
          }
        }
        if (cacheArr.length > option.gcCacheArrNum) {
          cacheArr = cacheArr.filter(Boolean); // 回收对象
        }
        return isReject ? Promise.reject(`Reuqest: ${url} has been ignored. requestId:${id}`) : data;
      });
    },
  };
}
