import type { JaFetchRequestInit, JaRequestInfo } from './types';
import { isFn } from './utils';

type ReqOnFulfilled = (url: string, init: JaFetchRequestInit) => JaFetchRequestInit | Promise<JaFetchRequestInit>;
type ResOnFulfilled = (data: any, requestInfo: JaRequestInfo, response: Response) => void;
type ReqOnRejected = (error: any, requestInfo: JaRequestInfo) => Promise<any>;
type ResOnRejected = (error: any, requestInfo: JaRequestInfo, response: Response) => Promise<any>;
type Store<T, U> = { id: number; onFulfilled: T; onRejected?: U }[];

class Interceptor<T, U> {
  /**保存use方法中，传入的拦截方法 */
  store: Store<T, U> = [];
  onFulfilled: T | undefined;
  onRejected: U | undefined;
  /**
   * 添加拦截器方法
   * @param onFulfilled
   * @param onRejected
   * @returns
   */
  use(onFulfilled: T, onRejected?: U): number {
    const checkParamValid = (v: any) => {
      if (v && !isFn(v)) {
        throw new TypeError('interceptor.use(onFulfilled, onRejected), onFulfilled is not a function');
      }
    };
    checkParamValid(onFulfilled);
    checkParamValid(onRejected);
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
      console.warn('Remove all interceptors');
      this.store = [];
    }
  }
}
export default class Interceptors {
  request = new Interceptor<ReqOnFulfilled, ReqOnRejected>();
  response = new Interceptor<ResOnFulfilled, ResOnRejected>();

  create() {
    return new Interceptors();
  }
  /**
   * 拦截器预设,use 另一个拦截器
   * @param {{install(interceptors:Interceptors)}} obj
   */
  use(obj: Interceptors | { install: (interceptors: Interceptors) => void }) {
    let interceptors: Interceptors;
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
