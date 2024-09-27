import coreFetch from './coreFetch';
import Interceptors from './interceptors';
import type { JaFetchRequestInit, JaRequestInfo } from './types';
import { checkInterceptorsRejectCallbackReturn } from './utils';

export default class Service {
  defaultInit: JaFetchRequestInit = {
    headers: {},
  };
  interceptors = new Interceptors();

  constructor(defaultInit?: JaFetchRequestInit) {
    this.defaultInit = { ...this.defaultInit, ...defaultInit };
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
    const {
      request: { store: reqStore = [] },
      response: { store: resStore = [] },
    } = this.interceptors;

    init = { ...this.defaultInit, ...init };

    // request interceptor
    for (const item of reqStore) {
      const r = await item.onFulfilled(url, init);
      if (r) init = r;
    }

    url = (init.baseURL || '') + url;

    const requestInfo: JaRequestInfo = { url, init };

    return coreFetch(url, init).then(
      response => {
        const callbackParam = [requestInfo, response] as const;

        if (response.ok) {
          let { responseType } = init;
          if (!responseType) responseType = 'json';

          let prom: Promise<any> = Promise.resolve(response);
          // set default response type to json
          if (responseType !== 'response') {
            prom = response[responseType]();
          }

          /**
           * response interceptor
           * 第一个拦截器中onFulfilled中的异常由下一个拦截器的onRejected处理
           */
          resStore.forEach(({ onFulfilled, onRejected }) => {
            prom = prom.then(
              data => onFulfilled(data, ...callbackParam),
              onRejected && (err => onRejected(err, ...callbackParam).then(checkInterceptorsRejectCallbackReturn)),
            );
          });

          return prom;
        } else {
          // ------------ response interceptor
          let resInterceptorRejectPromise: Promise<any> = Promise.reject(response);
          resStore.forEach(({ onRejected }) => {
            if (onRejected) {
              resInterceptorRejectPromise = resInterceptorRejectPromise
                .catch(err => onRejected(err, ...callbackParam))
                .then(checkInterceptorsRejectCallbackReturn);
            }
          });
          return resInterceptorRejectPromise;
        }
      },
      err => {
        // ------------ request interceptor (浏览器阻止请求)
        let reqInterceptorRejectPromise: Promise<any> = Promise.reject(err);
        reqStore.forEach(({ onRejected }) => {
          if (onRejected) {
            reqInterceptorRejectPromise = reqInterceptorRejectPromise
              .catch(err => onRejected(err, requestInfo))
              .then(checkInterceptorsRejectCallbackReturn);
          }
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
    return this.request<T>(url, init);
  }
  post<T>(url: string, init: JaFetchRequestInit = {}): Promise<T> {
    init.method = 'POST';
    return this.request<T>(url, init);
  }
  put<T>(url: string, init: JaFetchRequestInit = {}): Promise<T> {
    init.method = 'PUT';
    return this.request<T>(url, init);
  }
  del<T>(url: string, init: JaFetchRequestInit = {}): Promise<T> {
    init.method = 'DELETE';
    return this.request<T>(url, init);
  }
}
