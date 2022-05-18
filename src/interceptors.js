class Interceptor {
  /** @type {{id:string,onFulfilled:function,onRejected:function}[]} */
  store = []
  /**
   *
   * @param {(data:any,config:object,response:Response) => Promise} onFulfilled
   * @param {(url:string,config:object) => Promise} onRejected
   * @returns {number}
   */
  use(onFulfilled, onRejected) {
    if (onFulfilled && typeof onFulfilled !== 'function') {
      throw new TypeError('interceptor.use(onFulfilled, onRejected), parameter onFulfilled is not a function')
    }
    if (onRejected && typeof onRejected !== 'function') {
      throw new TypeError('interceptor.use(onFulfilled, onRejected), parameter onRejected is not a function')
    }
    this.onFulfilled = onFulfilled
    this.onRejected = onRejected

    const id = Date.now()
    // TODO: Order to sort
    this.store.push({ id, onFulfilled, onRejected }) // store
    return id
  }
  /**
   * if !id , remove all Interceptor
   * @param {number} id
   */
  remove(id) {
    if (id) {
      this.store = this.store.filter(it => it.id === id)
    } else {
      console.warn('Remove all Interceptor')
      this.store = []
    }
  }
}
export default class Interceptors {
  request = new Interceptor()
  response = new Interceptor()
  /**
   * 拦截器预设
   * @param {{install(interceptors:Interceptors)}} obj
   */
  use(obj) {
    const interceptors = new Interceptors()
    obj.install(interceptors)

    interceptors.request.store.forEach(item => {
      this.request.use(item.onFulfilled, item.onRejected)
    })
    interceptors.response.store.forEach(item => {
      this.response.use(item.onFulfilled, item.onRejected)
    })
    // release interceptors?
  }
  create() {
    return new Interceptors()
  }
}
