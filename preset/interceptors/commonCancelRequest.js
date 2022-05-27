/**
 * @typedef {import('../../src/interceptors').default} Interceptors
 */
/**
 * @typedef CommonCancelOption
 * @property {string} notInterceptKey
 * @property {number} [gcCacheArrNum=20]  缓存数组多于这个值则会过滤掉已返回的接口
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
export default function commonCancelRequest(abortFilter, option) {
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
      let cacheArr = []
      let requestId = 1
      interceptors.request.use((url, config) => {
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
      })

      interceptors.response.use((data, { config }) => {
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

        return data
      })
    },
  }
}
