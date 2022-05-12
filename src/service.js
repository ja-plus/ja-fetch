import coreFetch from './coreFetch.js'
import Interceptors from './interceptors.js'

export default class Service {
  defaultConf = {
    headers: {},
  }
  interceptors = new Interceptors()
  /**
   * @param {object} defaultConf
   */
  constructor(defaultConf) {
    this.defaultConf = Object.assign({}, this.defaultConf, defaultConf)
  }
  /**
   *
   * @param {string} url
   * @param {object} config
   */
  #requestAdapter(url, config) {
    const reqInterceptor = this.interceptors.request // 请求拦截器
    const resInterceptor = this.interceptors.response // 响应拦截器
    let assignedConf = Object.assign({}, this.defaultConf, config)

    // 请求拦截器
    // if (reqInterceptor.onFulfilled) {
    //   if (!assignedConf.headers) assignedConf.headers = {} // 没有headers就给一个空对象，便于拦截器中config.headers.xxx来使用
    //   let returnConf = reqInterceptor.onFulfilled(url, assignedConf) // 请求拦截器中修改请求配置
    //   if (returnConf) assignedConf = returnConf // 考虑使用拦截器的的时候直接修改形参option.来修改配置对象，且不返回的情况
    // }

    // 请求拦截器 multi
    if (reqInterceptor.store.length) {
      if (!assignedConf.headers) assignedConf.headers = {} // 没有headers就给一个空对象，便于拦截器中config.headers.xxx来使用
      reqInterceptor.store.forEach(item => {
        // TODO: async await
        let returnConf = item.onFulfilled(url, assignedConf) // 请求拦截器中修改请求配置
        if (returnConf) assignedConf = returnConf // 考虑使用拦截器的的时候直接修改形参option.来修改配置对象，且不返回的情况
      })
    }

    const fetchPromise = coreFetch(url, assignedConf)
      .catch(err => {
        // -------------请求错误,(浏览器阻止请求)
        const errObj = { err, config: assignedConf }
        // 构建catch链
        let reqInterceptorRejectPromise = Promise.reject(errObj)
        reqInterceptor.store.forEach(item => {
          reqInterceptorRejectPromise = reqInterceptorRejectPromise.catch(err => {
            let rejectedFuncReturn = item.onRejected(err)
            // 校验onRejected 的返回值，希望onRejected 函数必须返回一个Promise
            if (rejectedFuncReturn instanceof Promise) {
              return rejectedFuncReturn
            } else {
              console.warn(
                "request.interceptor.use(onFulfilled, onRejected): onRejected function not return Promise. Use Promise.reject() to jump to next request interceptor's onRejected Function",
              )
            }
          })
        })
        return reqInterceptorRejectPromise
      })
      .then(response => {
        if (response.ok) {
          const responseType = assignedConf.responseType
          let prom
          if (responseType === 'blob') prom = response.blob()
          else if (responseType === 'text') prom = response.text()
          else if (responseType === 'arraybuffer') prom = response.arrayBuffer()
          else if (responseType === 'response') prom = response
          // response.body
          else prom = response.json()

          // 添加响应拦截器
          resInterceptor.store.forEach(item => {
            prom = prom.then(data => {
              // onFulfilled 方法中的异常不会被onRejected方法处理
              return item.onFulfilled(data, assignedConf, response) // 可能要把response对象传给拦截器使用
            })
          })

          return prom
          // return prom.then(data => {
          //   // 添加响应拦截器
          //   return resInterceptor.onFulfilled
          //     ? resInterceptor.onFulfilled(data, assignedConf, response) // 可能要把response对象传给拦截器使用
          //     : data
          // })
        } else {
          // -------------响应错误
          // return Promise.reject({
          //   msg: `res status:${response.status}`,
          //   response,
          // })
          const errObj = { msg: `res status:${response.status}`, config: assignedConf }
          // 错误交给拦截器处理
          let resInterceptorRejectPromise = Promise.reject(errObj)
          resInterceptor.store.forEach(item => {
            resInterceptorRejectPromise = resInterceptorRejectPromise.catch(err => {
              return item.onRejected(err)
            })
          })
          return resInterceptorRejectPromise
        }
      })
    return fetchPromise
  }

  get(url, config = {}) {
    config.method = 'GET'
    return this.#requestAdapter(url, config)
  }
  post(url, config = {}) {
    config.method = 'POST'
    return this.#requestAdapter(url, config)
  }
  put(url, config = {}) {
    config.method = 'PUT'
    return this.#requestAdapter(url, config)
  }
  del(url, config = {}) {
    config.method = 'DELETE'
    return this.#requestAdapter(url, config)
  }
}
