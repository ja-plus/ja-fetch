/**
 * @typedef {((data: any, {url: string, config: object}, response: Response) => Promise | (url: string, config: object) => object)} Fulfilled
 */

import { JaFetchRequestInit } from './service';

type ReqOnFulfilled = (url: string, init: JaFetchRequestInit) => JaFetchRequestInit;
type ResOnFulfilled = (data: any, requestInfo: { url: string; config: JaFetchRequestInit }, response: Response) => void;
type OnRejected = (error: any) => Promise<any>;
/** */
type Store<T, U> = { id: number; onFulfilled: T; onRejected: U }[];

class Interceptor<T, U> {
  store: Store<T, U> = [];
  onFulfilled: T;
  onRejected: U;
  /**
   * 添加拦截器方法
   * @param onFulfilled
   * @param onRejected
   * @returns
   */
  use(onFulfilled: T, onRejected: U): number {
    if (onFulfilled && typeof onFulfilled !== 'function') {
      throw new TypeError('interceptor.use(onFulfilled, onRejected), parameter onFulfilled is not a function');
    }
    if (onRejected && typeof onRejected !== 'function') {
      throw new TypeError('interceptor.use(onFulfilled, onRejected), parameter onRejected is not a function');
    }
    this.onFulfilled = onFulfilled;
    this.onRejected = onRejected;

    const id = Date.now();
    // TODO: Order to sort
    this.store.push({ id, onFulfilled, onRejected }); // store
    return id;
  }
  /**
   * if !id , remove all Interceptor
   * @param {number} id
   */
  remove(id: number) {
    if (id) {
      this.store = this.store.filter(it => it.id === id);
    } else {
      console.warn('Remove all Interceptor');
      this.store = [];
    }
  }
}
export default class Interceptors {
  request = new Interceptor<ReqOnFulfilled, OnRejected>();
  response = new Interceptor<ResOnFulfilled, OnRejected>();
  /**
   * 拦截器预设
   * @param {{install(interceptors:Interceptors)}} obj
   */
  use(obj: { install: (interceptors: Interceptors) => void }) {
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
    return new Interceptors();
  }
}
