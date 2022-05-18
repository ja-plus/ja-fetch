/**
 * @typedef {import('../src/interceptors').default} Interceptors
 */
/**
 * @typedef FilterParam
 * @property {string} url
 * @property {object} config
 * @property {AbortController} [_controller] private param
 */

/**
 * @param {(storedRequest:FilterParam, nowRequest:FilterParam) => boolean} [abortFilter] default: url === url
 * @return
 */
export function commonCancelRequest(abortFilter) {
  return {
    /**
     * @param {Interceptors} interceptors instance
     */
    install(interceptors) {
      /** @type {FilterParam[]} */
      let cacheArr = []
      interceptors.request.use((url, config) => {
        for (let i = 0; i < cacheArr.length; i++) {
          let item = cacheArr[i]
          if (!item) continue
          if (abortFilter) {
            if (abortFilter(item, { url, config })) {
              item._controller.abort()
              cacheArr[i] = null
            }
          } else if (item?.url === url) {
            item._controller.abort()
            cacheArr[i] = null
          }
        }
        const abController = new AbortController()
        config.signal = abController.signal
        cacheArr.push({
          url,
          config,
          _controller: abController,
        })
        return config
      })

      interceptors.response.use(data => {
        if (cacheArr.length > 20) {
          cacheArr = cacheArr.filter(Boolean) // 回收对象
        }
        // console.log('cacheArr', cacheArr)
        return data
      })
    },
  }
}
