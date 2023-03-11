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
function commonCancelRequest(abortFilter, option) {
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

          init._commonCancelRequest = { requestId };

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
        for (let i = 0; i < cacheArr.length; i++) {
          const item = cacheArr[i];
          if (!item) continue;
          if (item.requestId === init._commonCancelRequest?.requestId) {
            isReject = Boolean(item?.canceled);
            cacheArr[i] = null;
            break;
          }
        }
        if (cacheArr.length > option.gcCacheArrNum) {
          cacheArr = cacheArr.filter(Boolean); // 回收对象
        }
        return isReject ? Promise.reject(`Request: ${url} has been ignored.`) : data;
      });
    },
  };
}

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
 * 在一个请求发起后未返回时，忽略之后发起的相同请求
 * set config.notThrottle = true 时则不拦截
 * @param {FilterFunc} throttleFilter
 * @param {CommonThrottleOption} [option]
 * @return {{install(interceptors:Interceptors):void}}
 */
function commonThrottleRequest(throttleFilter, option) {
  const defaultOption = {
    notInterceptKey: 'notThrottle',
  };
  option = Object.assign({}, defaultOption, option);
  if (!throttleFilter && typeof throttleFilter !== 'function') {
    throttleFilter = (currentConfig, storedConfig) =>
      currentConfig.url === storedConfig.url && currentConfig.init.method === storedConfig.init.method;
  }

  return {
    install(interceptors) {
      let requestId = 1;
      /** @type {RequestInfo[]} 保存*/
      let cacheArr = [];
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
        /**
         * request onFullfilled
         * @param {string} url
         * @param {RequestInit} init will pass to fetch
         * @returns
         */
        (url, init) => {
          if (init[option.notInterceptKey]) return init;
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
            if (throttleFilter({ url, init }, storedConfig)) {
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

/**请求并行队列 */
function parallelTask(option = {}) {
    const { limit = 5 } = option;
    let taskCount = 0;
    const taskList = [];
    /**Consume a task */
    function digestTask() {
        taskCount -= 1;
        const cachedRequest = taskList.shift();
        if (cachedRequest) {
            cachedRequest.resolve(cachedRequest.init);
            taskCount += 1;
        }
    }
    return {
        install(interceptors) {
            interceptors.request.use((url, init) => {
                if (taskCount < limit) {
                    taskCount += 1;
                    return init;
                }
                // add to task queue
                return new Promise((resolve, reject) => {
                    const request = { url, init, resolve, reject };
                    taskList.push(request);
                });
            });
            interceptors.response.use(data => {
                digestTask();
                return data;
            }, err => {
                digestTask();
                return Promise.reject(err);
            });
        },
    };
}

export { commonCancelRequest, parallelTask as commonParallelRequest, commonThrottleRequest };
//# sourceMappingURL=interceptors.js.map
