import Interceptors$3 from '@/interceptors';

/** `response` is private type */
type ResponseType = 'response' | 'text' | 'blob' | 'arrayBuffer' | 'json' | 'formData';
interface JaFetchRequestInit<T = ResponseType> extends RequestInit {
    /**not JSON.stringify(body) */
    rawBody?: boolean;
    /** base url add in front of url */
    baseURL?: string;
    /**url request param */
    params?: any;
    /**
     * response type default: json
     */
    responseType?: T;
    body?: any | BodyInit;
    /** custom */
    [k: string]: any;
}
type JaRequestInfo = {
    url: string;
    init: JaFetchRequestInit;
};

type ReqOnFulfilled = (url: string, init: JaFetchRequestInit) => JaFetchRequestInit | Promise<JaFetchRequestInit>;
type ResOnFulfilled = (data: any, requestInfo: JaRequestInfo, response: Response) => void;
type ReqOnRejected = (error: any, requestInfo: JaRequestInfo) => Promise<any>;
type ResOnRejected = (error: any, requestInfo: JaRequestInfo, response: Response) => Promise<any>;
type Store<T, U> = {
    id: number;
    onFulfilled: T;
    onRejected?: U;
}[];
declare class Interceptor<T, U> {
    /**保存use方法中，传入的拦截方法 */
    store: Store<T, U>;
    onFulfilled: T | undefined;
    onRejected: U | undefined;
    /**
     * 添加拦截器方法
     * @param onFulfilled
     * @param onRejected
     * @returns
     */
    use(onFulfilled: T, onRejected?: U): number;
    /**
     * if !id , remove all Interceptor
     * @param {number} id
     */
    remove(id?: number): void;
}
declare class Interceptors$2 {
    request: Interceptor<ReqOnFulfilled, ReqOnRejected>;
    response: Interceptor<ResOnFulfilled, ResOnRejected>;
    create(): Interceptors$2;
    /**
     * 拦截器预设,use 另一个拦截器
     * @param {{install(interceptors:Interceptors)}} obj
     */
    use(obj: Interceptors$2 | {
        install: (interceptors: Interceptors$2) => void;
    }): void;
}

/**
 * @typedef {import('../../interceptors').default} Interceptors
 * ---
 * @typedef CommonCancelOption
 * @property {string} notInterceptKey
 * @property {number} gcCacheArrNum
 * ---
 * @typedef RequestInfo
 * @property {string} url
 * @property {RequestInit} init
 * @property {number} requestId private param
 * @property {boolean} [canceled]
 * @property {AbortController} [_controller] private param
 * ---
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
    install(interceptors: Interceptors$1): void;
};
/**
 * ---
 */
type Interceptors$1 = Interceptors$2;
type CommonCancelOption = {
    notInterceptKey: string;
    /**
     * ---
     */
    gcCacheArrNum: number;
};
type RequestInfo$1 = {
    url: string;
    init: RequestInit;
    /**
     * private param
     */
    requestId: number;
    canceled?: boolean | undefined;
    /**
     * private param
     * ---
     */
    _controller?: AbortController | undefined;
};
type FilterFunc$1 = (currentConfig: RequestInfo$1, storedConfig: RequestInfo$1) => boolean;

/**
 * @typedef {import('../../interceptors').default} Interceptors
 * ---
 * @typedef CommonThrottleOption
 * @property {string} notInterceptKey
 * ---
 * @typedef RequestInfo
 * @property {string} url
 * @property {RequestInit} init
 * @property {number} requestId private param
 * @property {AbortController} [_controller] private param
 * ---
 * @callback FilterFunc
 * @param {RequestInfo} currentConfig
 * @param {RequestInfo} storedConfig
 * @returns {boolean}
 */
/**
 * 在一个请求发起后未返回时，忽略之后发起的相同请求
 * set config.notThrottle = true 时则不拦截
 * @param {FilterFunc} [throttleFilter]
 * @param {CommonThrottleOption} [option]
 * @return {{install(interceptors:Interceptors):void}}
 */
declare function commonThrottleRequest(throttleFilter?: FilterFunc | undefined, option?: CommonThrottleOption | undefined): {
    install(interceptors: Interceptors): void;
};
/**
 * ---
 */
type Interceptors = Interceptors$2;
type CommonThrottleOption = {
    /**
     * ---
     */
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
     * ---
     */
    _controller?: AbortController | undefined;
};
type FilterFunc = (currentConfig: RequestInfo, storedConfig: RequestInfo) => boolean;

type Option$1 = {
    /**parallel size */
    limit?: number;
};
/**请求并行队列 */
declare function commonParallelRequest(option?: Option$1): {
    install(interceptors: Interceptors$3): void;
};

type Option = {
    /**timeout ms */
    ms?: number;
};
/**超时 */
declare function commonTimeoutRequest(option?: Option): {
    install(interceptors: Interceptors$3): void;
};

export { commonCancelRequest, commonParallelRequest, commonThrottleRequest, commonTimeoutRequest };
