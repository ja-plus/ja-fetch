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
            if (val === undefined || val === null)
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
function checkInterceptorsReturn(rejectedFuncReturn, type) {
    if (rejectedFuncReturn instanceof Promise) {
        return rejectedFuncReturn;
    }
    else {
        // if not Promise, show warn
        console.warn(`${type === 0 ? 'request' : 'response'}.interceptor.use(onFulfilled, onRejected): onRejected not return Promise.`);
        return Promise.reject(rejectedFuncReturn);
    }
}

/**
 * TODO: 判断url类型
 * @param {string | URL} url url
 * @param {JaFetchRequestInit} init fetch init obj
 * @returns {Promise<Response>}
 */
function coreFetch(url, init) {
    // add url param
    const params = init.params;
    if (params)
        url = createUrlParamStr(url, params);
    if (!init.rawBody) {
        // init.body is object, not FormData
        if (typeof init.body === 'object' && !(init.body instanceof FormData)) {
            init.headers = Object.assign({ 'Content-Type': 'application/json' }, (init.headers || {}));
            try {
                init.body = JSON.stringify(init.body);
            }
            catch (e) {
                throw new Error("Can't stringify body");
            }
        }
    }
    if (!init.credentials)
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
        this.defaultInit = Object.assign(this.defaultInit, defaultInit);
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
            const reqInterceptor = this.interceptors.request;
            const resInterceptor = this.interceptors.response;
            let assignedInit = Object.assign({}, this.defaultInit, init);
            if (this.defaultInit.baseURL)
                url = this.defaultInit.baseURL + url;
            // request interceptor
            if (reqInterceptor.store.length) {
                if (!assignedInit.headers)
                    assignedInit.headers = {}; //便于 init.headers.xxx
                for (const item of reqInterceptor.store) {
                    assignedInit = yield item.onFulfilled(url, assignedInit);
                }
            }
            const requestInfo = { url, init: assignedInit };
            return coreFetch(url, assignedInit).then(response => {
                if (response.ok) {
                    const { responseType } = assignedInit;
                    let prom;
                    if (responseType === 'blob')
                        prom = response.blob();
                    else if (responseType === 'text')
                        prom = response.text();
                    else if (responseType === 'arraybuffer')
                        prom = response.arrayBuffer();
                    else if (responseType === 'response')
                        prom = Promise.resolve(response);
                    else
                        prom = response.json();
                    /**
                     * response interceptor
                     * 第一个拦截器中onFulfilled中的异常由下一个拦截器的onRejected处理
                     */
                    resInterceptor.store.forEach(item => {
                        prom = prom.then(data => item.onFulfilled(data, requestInfo, response), err => item.onRejected
                            ? item.onRejected(err, requestInfo, response).then((res) => checkInterceptorsReturn(res, 1))
                            : Promise.reject(err));
                    });
                    return prom;
                }
                else {
                    // ------------ response interceptor
                    let resInterceptorRejectPromise = Promise.reject(response);
                    resInterceptor.store.forEach(item => {
                        resInterceptorRejectPromise = resInterceptorRejectPromise
                            .catch(err => (item.onRejected ? item.onRejected(err, requestInfo, response) : Promise.reject(err)))
                            .then(res => checkInterceptorsReturn(res, 1));
                    });
                    return resInterceptorRejectPromise;
                }
            }, err => {
                // ------------ request interceptor (浏览器阻止请求)
                let reqInterceptorRejectPromise = Promise.reject(err);
                reqInterceptor.store.forEach(item => {
                    reqInterceptorRejectPromise = reqInterceptorRejectPromise
                        .catch(err => (item.onRejected ? item.onRejected(err, requestInfo) : Promise.reject(err)))
                        .then(res => checkInterceptorsReturn(res, 0));
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
        return this.requestAdapter(url, init);
    }
    post(url, init = {}) {
        init.method = 'POST';
        return this.requestAdapter(url, init);
    }
    put(url, init = {}) {
        init.method = 'PUT';
        return this.requestAdapter(url, init);
    }
    del(url, init = {}) {
        init.method = 'DELETE';
        return this.requestAdapter(url, init);
    }
}

/** ************
 * fetch 包装
 * TODO: timeout
 * 取消请求可使用abortController()
 ***********/
var index = new Service();

export { index as default };
//# sourceMappingURL=ja-fetch.js.map
