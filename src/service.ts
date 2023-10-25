import coreFetch from './coreFetch';
import Interceptors from './interceptors';
import type { JaFetchRequestInit, JaRequestInfo } from './types';
import { checkInterceptorsReturn } from './utils';

export default class Service {
  defaultInit: JaFetchRequestInit = {
    headers: {},
  };
  interceptors = new Interceptors();

  constructor(defaultInit?: JaFetchRequestInit) {
    this.defaultInit = Object.assign(this.defaultInit, defaultInit);
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
  private async requestAdapter(url: string, init: JaFetchRequestInit) {
    const reqInterceptor = this.interceptors.request;
    const resInterceptor = this.interceptors.response;
    let assignedInit = Object.assign({}, this.defaultInit, init);

    url = (this.defaultInit.baseURL || '') + url;

    // request interceptor
    if (reqInterceptor.store.length) {
      if (!assignedInit.headers) assignedInit.headers = {}; //便于 init.headers.xxx
      for (const item of reqInterceptor.store) {
        assignedInit = await item.onFulfilled(url, assignedInit);
      }
    }

    const requestInfo: JaRequestInfo = { url, init: assignedInit };

    return coreFetch(url, assignedInit).then(
      response => {
        if (response.ok) {
          const { responseType } = assignedInit;
          let prom: Promise<any>;
          if (responseType === 'blob') prom = response.blob();
          else if (responseType === 'text') prom = response.text();
          else if (responseType === 'arraybuffer') prom = response.arrayBuffer();
          else if (responseType === 'response') prom = Promise.resolve(response);
          else prom = response.json();

          /**
           * response interceptor
           * 第一个拦截器中onFulfilled中的异常由下一个拦截器的onRejected处理
           */
          resInterceptor.store.forEach(item => {
            prom = prom.then(
              data => item.onFulfilled(data, requestInfo, response),
              err =>
                item.onRejected
                  ? item.onRejected(err, requestInfo, response).then((res: any) => checkInterceptorsReturn(res, 1))
                  : Promise.reject(err),
            );
          });

          return prom;
        } else {
          // ------------ response interceptor
          let resInterceptorRejectPromise: Promise<any> = Promise.reject(response);
          resInterceptor.store.forEach(item => {
            resInterceptorRejectPromise = resInterceptorRejectPromise
              .catch(err => (item.onRejected ? item.onRejected(err, requestInfo, response) : Promise.reject(err)))
              .then(res => checkInterceptorsReturn(res, 1));
          });
          return resInterceptorRejectPromise;
        }
      },
      err => {
        // ------------ request interceptor (浏览器阻止请求)
        let reqInterceptorRejectPromise: Promise<any> = Promise.reject(err);
        reqInterceptor.store.forEach(item => {
          reqInterceptorRejectPromise = reqInterceptorRejectPromise
            .catch(err => (item.onRejected ? item.onRejected(err, requestInfo) : Promise.reject(err)))
            .then(res => checkInterceptorsReturn(res, 0));
        });
        return reqInterceptorRejectPromise;
      },
    );
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
