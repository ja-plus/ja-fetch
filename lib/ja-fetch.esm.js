/*! *****************************************************************************
Copyright (c) Microsoft Corporation.

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
PERFORMANCE OF THIS SOFTWARE.
***************************************************************************** */

function __awaiter(thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
}

/**
 * 拼接url参数
 * @param {string} url
 * @param {Object} params url param object
 * @returns {string}
 */
function createUrlParamStr(url, params) {
    const tmpUrl = new URL(url, window.location.origin);
    for (const key in params) {
        if (Object.hasOwnProperty.call(params, key)) {
            const val = params[key];
            if (val === void 0 || val === null)
                continue;
            tmpUrl.searchParams.append(key, val);
        }
    }
    return tmpUrl.href;
}
/**
 * check interceptors onRejected function's return
 * @param {any} rejectedFuncReturn
 * @param {Type} type
 * @returns
 */
function checkInterceptorsRejectCallbackReturn(rejectedFuncReturn) {
    return rejectedFuncReturn instanceof Promise ? rejectedFuncReturn : Promise.reject(rejectedFuncReturn);
}
// eslint-disable-next-line @typescript-eslint/ban-types
function isFn(fn) {
    return typeof fn === 'function';
}

/**
 * TODO: 判断url类型
 * @param {string | URL} url url
 * @param {JaFetchRequestInit} init fetch init obj
 * @returns {Promise<Response>}
 */
function coreFetch(url, init) {
    const { params, rawBody, body, headers, credentials } = init;
    // add url param
    if (params)
        url = createUrlParamStr(url, params);
    if (!rawBody) {
        // init.body is object, not FormData
        if (typeof body === 'object' && !(body instanceof FormData)) {
            init.headers = Object.assign({ 'Content-Type': 'application/json' }, headers);
            init.body = JSON.stringify(body);
        }
    }
    if (!credentials)
        init.credentials = 'same-origin'; // 自 2017 年 8 月 25 日以后，默认的 credentials 政策变更为 same-origin
    return fetch(url, init);
}

class Interceptor {
    constructor() {
        /**保存use方法中，传入的拦截方法 */
        this.store = [];
    }
    /**
     * 添加拦截器方法
     * @param onFulfilled
     * @param onRejected
     * @returns
     */
    use(onFulfilled, onRejected) {
        const checkParamValid = (v) => {
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
    remove(id) {
        if (id) {
            this.store = this.store.filter(it => it.id === id);
        }
        else {
            console.warn('Remove all interceptors');
            this.store = [];
        }
    }
}
class Interceptors {
    constructor() {
        this.request = new Interceptor();
        this.response = new Interceptor();
    }
    create() {
        return new Interceptors();
    }
    /**
     * 拦截器预设,use 另一个拦截器
     * @param {{install(interceptors:Interceptors)}} obj
     */
    use(obj) {
        let interceptors;
        if (obj instanceof Interceptors) {
            interceptors = obj;
        }
        else {
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

class Service {
    constructor(defaultInit) {
        this.defaultInit = {
            headers: {},
        };
        this.interceptors = new Interceptors();
        this.defaultInit = Object.assign(Object.assign({}, this.defaultInit), defaultInit);
    }
    /** create a new service */
    create(init) {
        return new Service(init);
    }
    /**
     * TODO: support Request
     * @param {string} url
     * @param {JaFetchRequestInit} init
     */
    requestAdapter(url, init) {
        return __awaiter(this, void 0, void 0, function* () {
            const { request: { store: reqStore = [] }, response: { store: resStore = [] }, } = this.interceptors;
            init = Object.assign(Object.assign({}, this.defaultInit), init);
            // request interceptor
            for (const item of reqStore) {
                const r = yield item.onFulfilled(url, init);
                if (r)
                    init = r;
            }
            url = (init.baseURL || '') + url;
            const requestInfo = { url, init };
            return coreFetch(url, init).then(response => {
                const callbackParam = [requestInfo, response];
                if (response.ok) {
                    let { responseType } = init;
                    if (!responseType)
                        responseType = 'json';
                    let prom = Promise.resolve(response);
                    // set default response type to json
                    if (responseType !== 'response') {
                        prom = response[responseType]();
                    }
                    /**
                     * response interceptor
                     * 第一个拦截器中onFulfilled中的异常由下一个拦截器的onRejected处理
                     */
                    resStore.forEach(({ onFulfilled, onRejected }) => {
                        prom = prom.then(data => onFulfilled(data, ...callbackParam), onRejected && (err => onRejected(err, ...callbackParam).then(checkInterceptorsRejectCallbackReturn)));
                    });
                    return prom;
                }
                else {
                    // ------------ response interceptor
                    let resInterceptorRejectPromise = Promise.reject(response);
                    resStore.forEach(({ onRejected }) => {
                        if (onRejected) {
                            resInterceptorRejectPromise = resInterceptorRejectPromise
                                .catch(err => onRejected(err, ...callbackParam))
                                .then(checkInterceptorsRejectCallbackReturn);
                        }
                    });
                    return resInterceptorRejectPromise;
                }
            }, err => {
                // ------------ request interceptor (浏览器阻止请求)
                let reqInterceptorRejectPromise = Promise.reject(err);
                reqStore.forEach(({ onRejected }) => {
                    if (onRejected) {
                        reqInterceptorRejectPromise = reqInterceptorRejectPromise
                            .catch(err => onRejected(err, requestInfo))
                            .then(checkInterceptorsRejectCallbackReturn);
                    }
                });
                return reqInterceptorRejectPromise;
            });
        });
    }
    request(url, init = {}) {
        return this.requestAdapter(url, init);
    }
    get(url, init = {}) {
        init.method = 'GET';
        return this.request(url, init);
    }
    post(url, init = {}) {
        init.method = 'POST';
        return this.request(url, init);
    }
    put(url, init = {}) {
        init.method = 'PUT';
        return this.request(url, init);
    }
    del(url, init = {}) {
        init.method = 'DELETE';
        return this.request(url, init);
    }
}

/** ************
 * fetch 包装
 * 取消请求可使用abortController()
 ***********/
var index = new Service();

export { index as default };
//# sourceMappingURL=ja-fetch.esm.js.map
