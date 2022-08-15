import coreFetch from './coreFetch';
import Interceptors from './interceptors';
import { checkInterceptorsReturn } from './utils';

export interface JaFetchRequestInit extends RequestInit {
  /**url请求参数 */
  params?: any;
  responseType?: 'text' | 'blob' | 'arraybuffer' | 'response';
}

export default class Service {
  defaultConf: JaFetchRequestInit = {
    headers: {},
  };
  interceptors = new Interceptors();
  /**
   * @param {object} defaultConf
   */
  constructor(defaultConf?: JaFetchRequestInit) {
    this.defaultConf = Object.assign({}, this.defaultConf, defaultConf);
  }
  /** create a new service */
  create(config?: JaFetchRequestInit) {
    return new Service(config);
  }
  /**
   * TODO: support Request
   * @param {string} url
   * @param {object} config
   */
  private requestAdapter(url: string, config: JaFetchRequestInit) {
    const reqInterceptor = this.interceptors.request; // 请求拦截器
    const resInterceptor = this.interceptors.response; // 响应拦截器
    let assignedConf = Object.assign({}, this.defaultConf, config);

    // 请求拦截器 multi
    if (reqInterceptor.store.length) {
      if (!assignedConf.headers) assignedConf.headers = {}; // 没有headers就给一个空对象，便于拦截器中config.headers.xxx来使用
      try {
        reqInterceptor.store.forEach(item => {
          // TODO: async await
          const returnConf = item.onFulfilled(url, assignedConf); // 请求拦截器中修改请求配置
          if (returnConf) assignedConf = returnConf; // 考虑使用拦截器的的时候直接修改形参option.来修改配置对象，且不返回的情况
        });
      } catch (err) {
        return Promise.reject(err);
      }
    }

    const requestInfo = { url, config: assignedConf };

    // return new Promise((resolve, reject) => {
    return coreFetch(url, assignedConf).then(
      response => {
        if (response.ok) {
          const responseType = assignedConf.responseType;
          let prom: Promise<any>;
          if (responseType === 'blob') prom = response.blob();
          else if (responseType === 'text') prom = response.text();
          else if (responseType === 'arraybuffer') prom = response.arrayBuffer();
          else if (responseType === 'response') prom = Promise.resolve(response);
          // response.body
          else prom = response.json();

          /**
           * 添加响应拦截器
           * 第一个拦截器中onFulfilled中的异常由下一个拦截器的onRejected处理
           */
          resInterceptor.store.forEach(item => {
            prom = prom.then(
              data => item.onFulfilled(data, requestInfo, response), // 可能要把response对象传给拦截器使用
              err => (item.onRejected ? item.onRejected(err).then((res: any) => checkInterceptorsReturn(res, 'response', err)) : Promise.reject(err)),
            );
          });
          // prom = prom.then(resolve).catch(reject)

          return prom;
        } else {
          // -------------响应错误
          const errObj = { response, ...requestInfo };
          // 错误交给拦截器处理
          let resInterceptorRejectPromise: Promise<any> = Promise.reject(errObj);
          resInterceptor.store.forEach(item => {
            resInterceptorRejectPromise = resInterceptorRejectPromise
              .catch(err => (item.onRejected ? item.onRejected(err) : Promise.reject(err)))
              .then(res => checkInterceptorsReturn(res, 'response', errObj));
          });
          return resInterceptorRejectPromise;
        }
      },
      err => {
        // -------------请求错误,(浏览器阻止请求)
        const errObj = { err, ...requestInfo };
        // 构建catch链
        let reqInterceptorRejectPromise: Promise<any> = Promise.reject(errObj);
        reqInterceptor.store.forEach(item => {
          reqInterceptorRejectPromise = reqInterceptorRejectPromise
            .catch(err => (item.onRejected ? item.onRejected(err) : Promise.reject(err)))
            .then(res => checkInterceptorsReturn(res, 'request', errObj));
        });
        return reqInterceptorRejectPromise;
      },
    );
    // })
  }

  request(url: string, config: JaFetchRequestInit = {}) {
    return this.requestAdapter(url, config);
  }
  get(url: string, config: JaFetchRequestInit = {}) {
    config.method = 'GET';
    return this.requestAdapter(url, config);
  }
  post(url: string, config: JaFetchRequestInit = {}) {
    config.method = 'POST';
    return this.requestAdapter(url, config);
  }
  put(url: string, config: JaFetchRequestInit = {}) {
    config.method = 'PUT';
    return this.requestAdapter(url, config);
  }
  del(url: string, config: JaFetchRequestInit = {}) {
    config.method = 'DELETE';
    return this.requestAdapter(url, config);
  }
}
