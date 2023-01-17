import coreFetch from './coreFetch';
import Interceptors from './interceptors';
import { checkInterceptorsReturn } from './utils';

export interface JaFetchRequestInit extends RequestInit {
  /**not JSON.stringify(body) */
  rawBody?: boolean;
  /**基本url */
  baseURL?: string;
  /**url请求参数 */
  params?: any;
  responseType?: 'text' | 'blob' | 'arraybuffer' | 'response';
  body?: any | BodyInit;
}

export default class Service {
  defaultInit: JaFetchRequestInit = {
    headers: {},
  };
  interceptors = new Interceptors();

  constructor(defaultInit?: JaFetchRequestInit) {
    this.defaultInit = Object.assign({}, this.defaultInit, defaultInit);
  }
  /** create a new service */
  create(init?: JaFetchRequestInit) {
    return new Service(init);
  }
  /**
   * TODO: support Request
   * @param {string} url
   * @param {JaFetchRequestInit} init
   */
  private requestAdapter(url: string, init: JaFetchRequestInit) {
    const reqInterceptor = this.interceptors.request; // 请求拦截器
    const resInterceptor = this.interceptors.response; // 响应拦截器
    let assignedInit = Object.assign({}, this.defaultInit, init);

    // 拼接baseURL
    if (this.defaultInit.baseURL) url = this.defaultInit.baseURL + url;

    // 请求拦截器 multi
    if (reqInterceptor.store.length) {
      if (!assignedInit.headers) assignedInit.headers = {}; // 没有headers就给一个空对象，便于拦截器中config.headers.xxx来使用
      try {
        reqInterceptor.store.forEach(item => {
          // TODO: async await
          const returnConf = item.onFulfilled(url, assignedInit); // 请求拦截器中修改请求配置
          if (returnConf) assignedInit = returnConf; // 考虑使用拦截器的的时候直接修改形参option.来修改配置对象，且不返回的情况
        });
      } catch (err) {
        return Promise.reject(err);
      }
    }

    const requestInfo = { url, init: assignedInit };

    // return new Promise((resolve, reject) => {
    return coreFetch(url, assignedInit).then(
      response => {
        if (response.ok) {
          const { responseType } = assignedInit;
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

  request<T>(url: string, init: JaFetchRequestInit = {}): Promise<T> {
    return this.requestAdapter(url, init);
  }
  get<T>(url: string, init: JaFetchRequestInit = {}): Promise<T> {
    init.method = 'GET';
    return this.requestAdapter(url, init);
  }
  post<T>(url: string, init: JaFetchRequestInit = {}): Promise<T> {
    init.method = 'POST';
    return this.requestAdapter(url, init);
  }
  put<T>(url: string, init: JaFetchRequestInit = {}): Promise<T> {
    init.method = 'PUT';
    return this.requestAdapter(url, init);
  }
  del<T>(url: string, init: JaFetchRequestInit = {}): Promise<T> {
    init.method = 'DELETE';
    return this.requestAdapter(url, init);
  }
}
