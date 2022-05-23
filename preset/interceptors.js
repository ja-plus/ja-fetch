/**
 * @typedef {import('../src/interceptors').default} Interceptors
 */
/**
 * @typedef FilterParam
 * @property {string} url
 * @property {object} config
 * @property {number} _pendingUid
 * @property {AbortController} [_controller] private param
 */
/**
 * @typedef Option
 * @property {string} [notCancelKey="notCancel"]
 * @property {number} [gcCacheArrNum=20]  缓存数组多于这个值则会过滤掉已返回的接口
 */
/**
 * @callback AbortFilter
 * @param {FilterParam} storedRequest
 * @param {FilterParam} nowRequest
 * @returns {boolean}
 */

/**
 * set config.notCancel = true 时则不会取消请求
 * @param {AbortFilter} [abortFilter] default: url === url, method === method
 * @param {Option} [option]
 * @return {{install(interceptors:Interceptors):void}}
 */
export function commonCancelRequest(abortFilter, option) {
  /** @type {Option} */
  const defaultOption = {
    notCancelKey: 'notCancel',
    gcCacheArrNum: 20,
  }
  option = Object.assign({}, option, defaultOption)

  if (!abortFilter && typeof abortFilter !== 'function') {
    abortFilter = (store, now) => store.url === now.url && store.config.method === now.config.method
  }

  return {
    install(interceptors) {
      /** @type {FilterParam[]} */
      let cacheArr = [] // TODO: WeakSet?
      let uid = 1
      interceptors.request.use((url, config) => {
        if (config[option.notCancelKey]) return config

        const abController = new AbortController()
        config.signal = abController.signal
        const storedObj = {
          url,
          config,
          _controller: abController,
          _pendingUid: uid,
        }
        config._pendingUid = uid++

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
          if (item._pendingUid === config._pendingUid) {
            cacheArr[i] = null
            break
          }
        }
        if (cacheArr.length > option.gcCacheArrNum) {
          cacheArr = cacheArr.filter(Boolean) // 回收对象
        }

        // console.log('cacheArr', cacheArr)
        return data
      })
    },
  }
}
