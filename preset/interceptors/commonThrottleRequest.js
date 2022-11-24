/**
 * @typedef {import('../../src/interceptors').default} Interceptors
 */
/**
 * @typedef CommonThrottleOption
 * @property {string} notInterceptKey
 */
/**
 * @typedef RequestInfo
 * @property {string} url
 * @property {object} config
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
 * 在一个请求发起后未返回时，忽略之后发起的相同请求
 * set config.notThrottle = true 时则不拦截
 * @param {FilterFunc} throttleFilter
 * @param {CommonThrottleOption} [option]
 * @return {{install(interceptors:Interceptors):void}}
 */
export default function commonThrottleRequest(throttleFilter, option) {
  const defaultOption = {
    notInterceptKey: 'notThrottle',
  };
  option = Object.assign({}, defaultOption, option);
  if (!throttleFilter && typeof throttleFilter !== 'function') {
    throttleFilter = (currentConfig, storedConfig) =>
      currentConfig.url === storedConfig.url && currentConfig.config.method === storedConfig.config.method;
  }

  return {
    install(interceptors) {
      /** @type {RequestInfo[]} 保存*/
      let cacheArr = [];
      let cacheArr_clean = config => {
        // 请求已返回则移除保存
        for (let i = 0; i < cacheArr.length; i++) {
          if (cacheArr[i]?.requestId === config._commonThrottleRequest?.requestId) {
            cacheArr[i] = null;
            break;
          }
        }
        if (cacheArr.length > 20) {
          cacheArr = cacheArr.filter(Boolean);
        }
      };
      let requestId = 1;

      interceptors.request.use(
        (url, config) => {
          if (config[option.notInterceptKey]) return config;

          let hasRequestStored = false;
          let emptyIndex = cacheArr.length; // cacheArr 中空位的index
          const storeObj = { requestId, url, config };
          for (let i = 0; i < cacheArr.length; i++) {
            const storedConfig = cacheArr[i];
            if (!storedConfig) {
              emptyIndex = i;
              continue;
            }
            if (throttleFilter({ url, config }, storedConfig)) {
              hasRequestStored = true;
              throw new Error('commonThrottleRequest: 该请求已发起未返回，不能重新发起。已忽略。');
            }
          }
          // 传递到response 回调中
          config._commonThrottleRequest = {
            requestId: requestId++,
          };

          if (!hasRequestStored) {
            // 没保存请求则保存
            cacheArr[emptyIndex] = storeObj;
          }
          return config;
        },
        err => {
          if (err.config) cacheArr_clean(err.config);
          return Promise.reject(err);
        },
      );

      interceptors.response.use(
        (data, { config }) => {
          cacheArr_clean(config);
          return data;
        },
        err => {
          if (err.config) cacheArr_clean(err.config);
          return Promise.reject(err);
        },
      );
    },
  };
}
