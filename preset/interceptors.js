/**
 * @typedef {import('../src/interceptors').default} Interceptors
 */
/**
 * @typedef RequestInfo
 * @property {string} url
 * @property {object} config
 * @property {number} requestId private param
 * @property {AbortController} [_controller] private param
 */
/**
 * @typedef CommonCancelOption
 * @property {string} notInterceptKey
 * @property {number} [gcCacheArrNum=20]  缓存数组多于这个值则会过滤掉已返回的接口
 */
/**
 * @callback FilterFunc
 * @param {RequestInfo} storedRequest
 * @param {RequestInfo} nowRequest
 * @returns {boolean}
 */

/**
 * 取消之前发起的相同的请求
 * set config.notCancel = true 时则不拦截
 * @param {FilterFunc} [abortFilter] default: url === url, method === method
 * @param {CommonCancelOption} [option]
 * @return {{install(interceptors:Interceptors):void}}
 */
export function commonCancelRequest(abortFilter, option) {
  /** @type {CommonCancelOption} */
  const defaultOption = {
    notInterceptKey: 'notCancel',
    gcCacheArrNum: 20,
  }
  option = Object.assign({}, option, defaultOption)

  if (!abortFilter && typeof abortFilter !== 'function') {
    abortFilter = (store, now) => store.url === now.url && store.config.method === now.config.method
  }

  return {
    install(interceptors) {
      /** @type {RequestInfo[]} */
      let cacheArr = [] // TODO: WeakSet?
      let requestId = 1
      interceptors.request.use(
        (url, config) => {
          if (config[option.notInterceptKey]) return config

          const abController = new AbortController()
          config.signal = abController.signal
          const storedObj = {
            url,
            config,
            requestId,
            _controller: abController,
          }
          config._commonCancelRequest = {
            requestId: requestId++,
          }

          let hasPendingRequest = false
          for (let i = 0; i < cacheArr.length; i++) {
            const item = cacheArr[i]
            if (!item) continue
            if (abortFilter(item, { url, config })) {
              item._controller.abort()
              hasPendingRequest = true
              cacheArr[i] = storedObj // replace old obj with new
            }
          }

          if (!hasPendingRequest) {
            cacheArr.push(storedObj)
          }
          return config
        },
        err => {
          // TODO:
        },
      )

      interceptors.response.use(
        (data, { config }) => {
          for (let i = 0; i < cacheArr.length; i++) {
            const item = cacheArr[i]
            if (!item) continue
            if (item.requestId === config._commonCancelRequest?.requestId) {
              cacheArr[i] = null
              break
            }
          }
          if (cacheArr.length > option.gcCacheArrNum) {
            cacheArr = cacheArr.filter(Boolean) // 回收对象
          }

          // console.log('cacheArr', cacheArr)
          return data
        },
        err => {
          // TODO:
        },
      )
    },
  }
}

/**
 * @typedef CommonThrottleOption
 * @property {string} notInterceptKey
 */

/**
 * 在一个请求发起后未返回时，忽略之后发起的相同请求
 * set config.notThrottle = true 时则不拦截
 * @param {FilterFunc} throttleFilter
 * @param {CommonThrottleOption} [option]
 * @return {{install(interceptors:Interceptors):void}}
 */
export function commonThrottleRequest(throttleFilter, option) {
  const defaultOption = {
    notInterceptKey: 'notThrottle',
  }
  option = Object.assign({}, option, defaultOption)
  if (!throttleFilter && typeof throttleFilter !== 'function') {
    throttleFilter = (store, now) => store.url === now.url && store.config.method === now.config.method
  }

  return {
    install(interceptors) {
      /** @type {RequestInfo[]} 保存*/
      let cacheArr = []
      let requestId = 1

      interceptors.request.use((url, config) => {
        if (config[option.notThrottleKey]) return config

        let hasRequestStored = false
        let emptyIndex = cacheArr.length // cacheArr 中空位的index
        const storeObj = { requestId, url, config }
        for (let i = 0; i < cacheArr.length; i++) {
          const item = cacheArr[i]
          if (!item) {
            emptyIndex = i
            continue
          }
          if (throttleFilter(item, { url, config })) {
            hasRequestStored = true
            throw new Error('commonThrottleRequest: 该请求已发起未返回，不能重新发起。已忽略。')
          }
        }
        // 传递到response 回调中
        config._commonThrottleRequest = {
          requestId: requestId++,
        }

        if (!hasRequestStored) {
          // 没保存请求则保存
          cacheArr[emptyIndex] = storeObj
        }
        return config
      })

      interceptors.response.use((data, { config }) => {
        // 请求已返回则移除保存
        for (let i = 0; i < cacheArr.length; i++) {
          if (cacheArr[i].requestId === config._commonThrottleRequest.requestId) {
            cacheArr[i] = null
            break
          }
        }
        if (cacheArr.length > 20) {
          cacheArr = cacheArr.filter(Boolean)
        }
        return data
      })
    },
  }
}
