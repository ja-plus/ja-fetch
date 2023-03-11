import Interceptors from '@/interceptors';

/**
 * @typedef {import('../../src/interceptors').default} Interceptors
 */
/**
 * @typedef CommonCancelOption
 * @property {string} notInterceptKey
 * @property {number} [gcCacheArrNum=20]
 */
/**
 * @typedef RequestInfo
 * @property {string} url
 * @property {RequestInit} init
 * @property {number} requestId private param
 * @property {AbortController} [_controller] private param
 */
/**
 * @callback FilterFunc
 * @param {RequestInfo} currentConfig
 * @param {RequestInfo} storedConfig
 * @returns {boolean}
 */
/**
 * 用AbortController 取消之前发起的相同的请求
 * set config.notCancel = true 时则不拦截
 * @param {FilterFunc} [abortFilter] default: url === url, method === method
 * @param {CommonCancelOption} [option]
 * @return {{install(interceptors:Interceptors):void}}
 */
declare function commonCancelRequest(abortFilter?: FilterFunc$1 | undefined, option?: CommonCancelOption | undefined): {
    install(interceptors: any): void;
};
type CommonCancelOption = {
    notInterceptKey: string;
    gcCacheArrNum?: number | undefined;
};
type RequestInfo$1 = {
    url: string;
    init: RequestInit;
    /**
     * private param
     */
    requestId: number;
    /**
     * private param
     */
    _controller?: AbortController | undefined;
};
type FilterFunc$1 = (currentConfig: RequestInfo$1, storedConfig: RequestInfo$1) => boolean;

/**
 * @typedef {import('../../src/interceptors').default} Interceptors
 */
/**
 * @typedef CommonThrottleOption
 * @property {string} notInterceptKey
 */
/**
 * @typedef RequestInfo
 * @property {string} url
 * @property {RequestInit} init
 * @property {number} requestId private param
 * @property {AbortController} [_controller] private param
 */
/**
 * @callback FilterFunc
 * @param {RequestInfo} currentConfig
 * @param {RequestInfo} storedConfig
 * @returns {boolean}
 */
/**
 * 在一个请求发起后未返回时，忽略之后发起的相同请求
 * set config.notThrottle = true 时则不拦截
 * @param {FilterFunc} throttleFilter
 * @param {CommonThrottleOption} [option]
 * @return {{install(interceptors:Interceptors):void}}
 */
declare function commonThrottleRequest(throttleFilter: FilterFunc, option?: CommonThrottleOption | undefined): {
    install(interceptors: any): void;
};
type CommonThrottleOption = {
    notInterceptKey: string;
};
type RequestInfo = {
    url: string;
    init: RequestInit;
    /**
     * private param
     */
    requestId: number;
    /**
     * private param
     */
    _controller?: AbortController | undefined;
};
type FilterFunc = (currentConfig: RequestInfo, storedConfig: RequestInfo) => boolean;

type Option = {
    /**parallel size */
    limit?: number;
};
/**请求并行队列 */
declare function commonParallelRequest(option?: Option): {
    install(interceptors: Interceptors): void;
};

export { commonCancelRequest, commonParallelRequest, commonThrottleRequest };
