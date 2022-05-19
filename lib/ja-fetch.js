/**
 * 拼接url参数
 * @param {string} url url字符串
 * @param {Object} params url参数对象
 * @returns {string}
 */
function createUrlParamStr(url, params) {
  let tmpUrl = new URL(url, window.location); // 如果是url是相对路径，则会加上第二个参数
  for (const key in params) {
    tmpUrl.searchParams.append(key, params[key]);
  }
  return tmpUrl.href
}

/**
 * @param {string | Request} url url
 * @param {object} config fetch init obj
 * @returns {Promise<Response>}
 */
function coreFetch(url, config) {
  // TODO: 判断url类型
  const params = config.params;
  // 拼url参数
  if (params) url = createUrlParamStr(url, params);

  if (config.body) {
    // conf.body is object
    if (!(config.body instanceof FormData) && typeof config.body === 'object') {
      config.headers = Object.assign(
        {
          'Content-Type': 'application/json',
        },
        config.headers || {},
      );
      try {
        config.body = JSON.stringify(config.body);
      } catch (e) {
        throw new Error('cannot stringify body json')
      }
    }
  }
  if (!config.credentials) config.credentials = 'same-origin'; // 自 2017 年 8 月 25 日以后，默认的 credentials 政策变更为 same-origin

  return fetch(url, config)
}

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
    this.onFulfilled = onFulfilled;
    this.onRejected = onRejected;

    const id = Date.now();
    // TODO: Order to sort
    this.store.push({ id, onFulfilled, onRejected }); // store
    return id
  }
  /**
   * if !id , remove all Interceptor
   * @param {number} id
   */
  remove(id) {
    if (id) {
      this.store = this.store.filter(it => it.id === id);
    } else {
      console.warn('Remove all Interceptor');
      this.store = [];
    }
  }
}
class Interceptors {
  request = new Interceptor()
  response = new Interceptor()
  /**
   * 拦截器预设
   * @param {{install(interceptors:Interceptors)}} obj
   */
  use(obj) {
    const interceptors = new Interceptors();
    obj.install(interceptors);

    interceptors.request.store.forEach(item => {
      this.request.use(item.onFulfilled, item.onRejected);
    });
    interceptors.response.store.forEach(item => {
      this.response.use(item.onFulfilled, item.onRejected);
    });
    // release interceptors?
  }
  create() {
    return new Interceptors()
  }
}

class Service {
  #defaultConf = {
    headers: {},
  }
  interceptors = new Interceptors()
  /**
   * @param {object} defaultConf
   */
  constructor(defaultConf) {
    this.#defaultConf = Object.assign({}, this.#defaultConf, defaultConf);
  }
  /** create a new service */
  create(config) {
    return new Service(config)
  }
  /**
   *
   * @param {string} url
   * @param {object} config
   */
  #requestAdapter(url, config) {
    const reqInterceptor = this.interceptors.request; // 请求拦截器
    const resInterceptor = this.interceptors.response; // 响应拦截器
    let assignedConf = Object.assign({}, this.#defaultConf, config);

    // 请求拦截器 multi
    if (reqInterceptor.store.length) {
      if (!assignedConf.headers) assignedConf.headers = {}; // 没有headers就给一个空对象，便于拦截器中config.headers.xxx来使用
      reqInterceptor.store.forEach(item => {
        // TODO: async await
        let returnConf = item.onFulfilled(url, assignedConf); // 请求拦截器中修改请求配置
        if (returnConf) assignedConf = returnConf; // 考虑使用拦截器的的时候直接修改形参option.来修改配置对象，且不返回的情况
      });
    }

    // return new Promise((resolve, reject) => {
    return coreFetch(url, assignedConf).then(
      response => {
        if (response.ok) {
          const responseType = assignedConf.responseType;
          let prom;
          if (responseType === 'blob') prom = response.blob();
          else if (responseType === 'text') prom = response.text();
          else if (responseType === 'arraybuffer') prom = response.arrayBuffer();
          else if (responseType === 'response') prom = response;
          // response.body
          else prom = response.json();

          /**
           * 添加响应拦截器
           * 第一个拦截器中onFulfilled中的异常由下一个拦截器的onRejected处理
           */
          resInterceptor.store.forEach(item => {
            prom = prom.then(
              data => {
                // onFulfilled 方法中的异常不会被onRejected方法处理
                return item.onFulfilled(data, assignedConf, response) // 可能要把response对象传给拦截器使用
              },
              err => {
                return item.onRejected ? item.onRejected(err) : Promise.reject(err)
              },
            );
          });
          // prom = prom.then(resolve).catch(reject)

          return prom
        } else {
          // -------------响应错误
          const errObj = { msg: `res status:${response.status}`, config: assignedConf };
          // 错误交给拦截器处理
          let resInterceptorRejectPromise = Promise.reject(errObj);
          resInterceptor.store.forEach(item => {
            resInterceptorRejectPromise = resInterceptorRejectPromise
              .catch(item.onRejected)
              .then(rejectedFuncReturn => {
                // 校验onRejected 的返回值，希望onRejected 函数必须返回一个Promise
                if (rejectedFuncReturn instanceof Promise) {
                  return rejectedFuncReturn
                } else {
                  console.warn(
                    "response.interceptor.use(onFulfilled, onRejected): onRejected function not return Promise. Use Promise.reject() to jump to next response interceptor's onRejected Function",
                  );
                  // reject()
                  return Promise.reject(errObj)
                }
              });
          });
          return resInterceptorRejectPromise
        }
      },
      err => {
        // -------------请求错误,(浏览器阻止请求)
        const errObj = { err, config: assignedConf };
        // 构建catch链
        let reqInterceptorRejectPromise = Promise.reject(errObj);
        reqInterceptor.store.forEach(item => {
          reqInterceptorRejectPromise = reqInterceptorRejectPromise.catch(item.onRejected).then(rejectedFuncReturn => {
            // 校验onRejected 的返回值，希望onRejected 函数必须返回一个Promise
            if (rejectedFuncReturn instanceof Promise) {
              return rejectedFuncReturn
            } else {
              console.warn(
                "request.interceptor.use(onFulfilled, onRejected): onRejected function not return Promise. Use Promise.reject() to jump to next request interceptor's onRejected Function",
              );
              // reject()
              return Promise.reject(errObj)
            }
          });
        });
        return reqInterceptorRejectPromise
      },
    )
    // })
  }

  get(url, config = {}) {
    config.method = 'GET';
    return this.#requestAdapter(url, config)
  }
  post(url, config = {}) {
    config.method = 'POST';
    return this.#requestAdapter(url, config)
  }
  put(url, config = {}) {
    config.method = 'PUT';
    return this.#requestAdapter(url, config)
  }
  del(url, config = {}) {
    config.method = 'DELETE';
    return this.#requestAdapter(url, config)
  }
}

/** ************
 * fetch 包装
 * TODO: timeout
 * 取消请求可使用abortController()
 ***********/

let service = new Service();

export { service as default };
