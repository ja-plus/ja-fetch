class Interceptor {
  /** @type {{id:string,onFulfilled:function,onRejected:function}[]} */
  store = []
  /** @type {Function} */
  onFulfilled = null
  /** @type {Function} */
  onRejected = null
  /**
   *
   * @param {Function} onFulfilled
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
    this.onFulfilled = null
    this.onRejected = null
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
   *
   * @param {function(Constructor<Interceptors>):Interceptors} pluginEntryFunc
   */
  plugin(pluginEntryFunc) {
    // TODO:
    const interceptors = pluginEntryFunc(Interceptors)
    // this.request.use(interceptors.request.onFulfilled, interceptors.request.onRejected);
    // this.response.use(interceptors.response.onFulfilled, interceptors.response.onRejected);
  }
  create() {
    return new Interceptors()
  }
}
