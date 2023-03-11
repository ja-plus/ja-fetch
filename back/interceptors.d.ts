declare module 'ja-fetch/preset/interceptors' {
  type DefaultOption = {
    /**不取消请求的key */
    notInterceptKey?: string;
    /**缓存数组多于这个值则会过滤掉已返回的接口 */
    gcCacheArrNum?: number;
  };
  type RequestConfig = {
    url: string;
    config: {
      params?: any;
      responseType?: 'text' | 'blob' | 'arraybuffer' | 'response';
    } & RequestInit;
  };
  type FilterFunc = (store: RequestConfig, now: RequestConfig) => boolean;
  /**
   * 取消之前发起的相同的请求
   * set config.notCancel = true 时则不拦截
   * @param {FilterFunc} [abortFilter] 自定义拦截方法，default: url === url, method === method
   * @param {DefaultOption} [option]
   * @return {{install(interceptors:Interceptors):void}}
   */
  export function commonCancelRequest(abortFilter?: FilterFunc | null, option?: DefaultOption): { install: (interceptors: any) => any };
  /**
   * 在一个请求发起后未返回时，忽略之后发起的相同请求
   * set config.notThrottle = true 时则不拦截
   * @param {FilterFunc} throttleFilter 自定义拦截方法
   * @param {DefaultOption} [option]
   * @return {{install(interceptors:Interceptors):void}}
   */
  export function commonThrottleRequest(
    throttleFilter?: FilterFunc | null,
    option?: Pick<DefaultOption, 'notInterceptKey'>,
  ): { install: (interceptors: any) => any };

  type Option = {
    /**parallel size */
    limit?: number;
  };
  /**请求并行队列 */
  export function commonParallelRequest(option?: Option): {
    install(interceptors: Interceptors): void;
  };
}
