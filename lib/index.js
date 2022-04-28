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
    return tmpUrl.href;
}

/**
 * @param {string} url url
 * @param {object} config fetch init obj
 * @returns {Promise<Response>}
 */
function coreFetch(url, config) {
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
                throw new Error('cannot stringify body json');
            }
        }
    }
    if (!config.credentials) config.credentials = 'same-origin'; // 自 2017 年 8 月 25 日以后，默认的 credentials 政策变更为 same-origin

    return fetch(url, config);
}

class Interceptor {
    /** @type {Array<{id:string,onFulfilled:function,onRejected:function}>} */
    // store = [];
    /** @type {Function} */
    onFulfilled = null;
    /** @type {Function} */
    onRejected = null;
    use(onFulfilled, onRejected) {
        if (onFulfilled && typeof onFulfilled !== 'function') {
            throw new TypeError('interceptor.add(onFulfilled, onRejected), parameter onFulfilled is not a function');
        }
        if (onRejected && typeof onRejected !== 'function') {
            throw new TypeError('interceptor.add(onFulfilled, onRejected), parameter onRejected is not a function');
        }
        this.onFulfilled = onFulfilled;
        this.onRejected = onRejected;
    }
    remove() {
        this.onFulfilled = null;
        this.onRejected = null;
    }
}
class Interceptors {
    request = new Interceptor();
    response = new Interceptor();
}

class Service {
    defaultConf = {
      headers: {},
    };
    interceptors = new Interceptors();
    /**
     * @param {object} defaultConf
     */
    constructor(defaultConf) {
      this.defaultConf = Object.assign({}, this.defaultConf, defaultConf);
    }
    /**
     *
     * @param {string} url
     * @param {object} config
     */
    #requestAdapter(url, config) {
      const reqInterceptor = this.interceptors.request; // 请求拦截器
      const resInterceptor = this.interceptors.response; // 响应拦截器
      let assignedConf = Object.assign({}, this.defaultConf, config);
  
      // 请求拦截器
      if (reqInterceptor.onFulfilled) {
        if (!assignedConf.headers) assignedConf.headers = {}; // 没有headers就给一个空对象，便于拦截器中config.headers.xxx来使用
        let returnConf = reqInterceptor.onFulfilled(url, assignedConf); // 请求拦截器中修改请求配置
        if (returnConf) assignedConf = returnConf; // 考虑使用拦截器的的时候直接修改形参option.来修改配置对象，且不返回的情况
      }
  
      const fetchPromise = coreFetch(url, assignedConf)
        .then(response => {
          if (response.ok) {
            const responseType = assignedConf.responseType;
            let prom;
            if (responseType === 'blob') prom = response.blob();
            else if (responseType === 'text') prom = response.text();
            else if (responseType === 'arraybuffer') prom = response.arrayBuffer();
            else if (responseType === 'response') prom = response;
            // response.body
            else prom = response.json();
            return prom.then(data => {
              // 添加响应拦截器
              return resInterceptor.onFulfilled
                ? resInterceptor.onFulfilled(data, assignedConf, response) // 可能要把response对象传给拦截器使用
                : data;
            });
          } else {
            // 响应错误
            return Promise.reject({
              msg: `res status:${response.status}`,
              response,
            });
          }
        })
        .catch(err => {
          // 错误交给拦截器处理
          if (err.response?.ok) {
            // 响应错误
            return resInterceptor.onRejected ? resInterceptor.onRejected({ err, config: assignedConf }) : Promise.reject({ err, config: assignedConf });
          } else {
            // 请求错误,(浏览器阻止请求)
            return reqInterceptor.onRejected ? reqInterceptor.onRejected({ err, config: assignedConf }) : Promise.reject({ err, config: assignedConf });
          }
        });
      return fetchPromise;
    }
    get(url, config = {}) {
      config.method = 'GET';
      return this.#requestAdapter(url, config);
    }
    post(url, config = {}) {
      config.method = 'POST';
      return this.#requestAdapter(url, config);
    }
    put(url, config = {}) {
      config.method = 'PUT';
      return this.#requestAdapter(url, config);
    }
    del(url, config = {}) {
      config.method = 'DELETE';
      return this.#requestAdapter(url, config);
    }
  }

/** ************
 * fetch 包装
 * TODO: timeout
 * 取消请求可使用abortController()
 ***********/

/**
 *
 * @param {string} type get post put delete
 * @param {string} url
 * @param {object} config
 * @returns
 */
function _requestAdapter(type, url, config = {}) {
  config.method = type;
  const responseType = config.responseType;
  return coreFetch(url, config).then(response => {
    if (response.ok) {
      if (responseType === 'blob') return response.blob();
      if (responseType === 'text') return response.text();
      if (responseType === 'arraybuffer') return response.arrayBuffer();
      if (responseType === 'response') return response; // response.body
      return response.json();
    } else {
      return Promise.reject({
        msg: `res status:${response.status}`,
        res: response,
      });
    }
  });
}
/**
 * @param {string} url
 * @param {object} config
 * @returns
 */
function _get(url, config) {
  return _requestAdapter('GET', url, config);
}
/**
 * @param {string} url
 * @param {object} config
 * @returns
 */
function _post(url, config) {
  return _requestAdapter('POST', url, config);
}
/**
 * @param {string} url
 * @param {object} config
 * @returns
 */
function _put(url, config) {
  return _requestAdapter('PUT', url, config);
}
/**
 * @param {string} url
 * @param {object} config
 * @returns
 */
function _del(url, config) {
  return _requestAdapter('DELETE', url, config);
}

/**
 *
 * @param {object} defaultConfig
 * @returns {Service}
 */
function _create(defaultConfig) {
  return new Service(defaultConfig);
}
var index = {
  create: _create,
  get: _get,
  post: _post,
  put: _put,
  del: _del,
};

export { _create as create, index as default, _del as del, _get as get, _post as post, _put as put };
