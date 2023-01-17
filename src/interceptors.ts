/**
 * @typedef {((data: any, {url: string, config: object}, response: Response) => Promise | (url: string, config: object) => object)} Fulfilled
 */

import { JaFetchRequestInit } from './service';

type ReqOnFulfilled = (url: string, init: JaFetchRequestInit) => JaFetchRequestInit;
type ResOnFulfilled = (data: any, request: { url: string; init: JaFetchRequestInit }, response: Response) => void;
type OnRejected = (error?: any) => Promise<any>;
type Store<T, U> = { id: number; onFulfilled: T; onRejected: U }[];

class Interceptor<T, U> {
  /**保存use方法中，传入的拦截方法 */
  store: Store<T, U> = [];
  onFulfilled: T;
  onRejected: U;
  /**
   * 添加拦截器方法
   * @param onFulfilled
   * @param onRejected
   * @returns
   */
  use(onFulfilled: T, onRejected?: U): number {
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
  remove(id?: number) {
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

  create() {
    return new Interceptors();
  }
  /**
   * 拦截器预设,use 另一个拦截器
   * @param {{install(interceptors:Interceptors)}} obj
   */
  use(obj: Interceptors | { install: (interceptors: Interceptors) => void }) {
    let interceptors;
    if (obj instanceof Interceptors) {
      interceptors = obj;
    } else {
      interceptors = new Interceptors();
      obj.install(interceptors);
    }

    interceptors.request.store.forEach(item => {
      this.request.use(item.onFulfilled, item.onRejected);
    });
    interceptors.response.store.forEach(item => {
      this.response.use(item.onFulfilled, item.onRejected);
    });
    // release interceptors?
  }
}
