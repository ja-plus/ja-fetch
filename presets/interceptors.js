/**
 * @return {(Interceptors.constructs) => Interceptors}
 */
export function abortControllerInterceptor() {
  /**
   * @param {Interceptors.constructs} Interceptors
   */
  return function (Interceptors) {
    let interceptors = new Interceptors()

    let cacheArr = []
    interceptors.request.use((url, config) => {
      cacheArr.forEach(item => {
        // TODO:
        if (item.url === url) {
          item.controller.abort()
          item.canceled = true
        }
      })
      const abController = new AbortController()
      config.signal = abController.signal
      cacheArr.push({
        url,
        controller: abController,
        cancel: false,
      })
    })

    interceptors.response.use(() => {
      cacheArr = cacheArr.filter(item => !item.canceled) // 仅保留未清除的,对象回收
    })

    return interceptors
  }
}
