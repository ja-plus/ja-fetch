function createUrlParamStr(url, params) {
    const tmpUrl = new URL(url, window.location.origin);
    for (const key in params) {
        if (Object.hasOwnProperty.call(params, key)) {
            tmpUrl.searchParams.append(key, params[key]);
        }
    }
    return tmpUrl.href;
}
function checkInterceptorsReturn(rejectedFuncReturn, type, errObj) {
    if (rejectedFuncReturn instanceof Promise) {
        return rejectedFuncReturn;
    }
    else {
        console.warn(`${type}.interceptor.use(onFulfilled, onRejected): onRejected not return Promise.`);
        return Promise.reject(errObj);
    }
}

function coreFetch(url, init) {
    const params = init.params;
    if (params)
        url = createUrlParamStr(url, params);
    if (init.body) {
        if (!(init.body instanceof FormData) && typeof init.body === 'object') {
            init.headers = Object.assign({ 'Content-Type': 'application/json' }, (init.headers || {}));
            try {
                init.body = JSON.stringify(init.body);
            }
            catch (e) {
                throw new Error('cannot stringify body json');
            }
        }
    }
    if (!init.credentials)
        init.credentials = 'same-origin';
    return fetch(url, init);
}

class Interceptor {
    constructor() {
        this.store = [];
    }
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
        this.store.push({ id, onFulfilled, onRejected });
        return id;
    }
    remove(id) {
        if (id) {
            this.store = this.store.filter(it => it.id === id);
        }
        else {
            console.warn('Remove all Interceptor');
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
    }
}

class Service {
    constructor(defaultInit) {
        this.defaultInit = {
            headers: {},
        };
        this.interceptors = new Interceptors();
        this.defaultInit = Object.assign({}, this.defaultInit, defaultInit);
    }
    create(init) {
        return new Service(init);
    }
    requestAdapter(url, init) {
        const reqInterceptor = this.interceptors.request;
        const resInterceptor = this.interceptors.response;
        let assignedInit = Object.assign({}, this.defaultInit, init);
        if (this.defaultInit.baseURL)
            url = this.defaultInit.baseURL + url;
        if (reqInterceptor.store.length) {
            if (!assignedInit.headers)
                assignedInit.headers = {};
            try {
                reqInterceptor.store.forEach(item => {
                    const returnConf = item.onFulfilled(url, assignedInit);
                    if (returnConf)
                        assignedInit = returnConf;
                });
            }
            catch (err) {
                return Promise.reject(err);
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
                resInterceptor.store.forEach(item => {
                    prom = prom.then(data => item.onFulfilled(data, requestInfo, response), err => (item.onRejected ? item.onRejected(err).then((res) => checkInterceptorsReturn(res, 'response', err)) : Promise.reject(err)));
                });
                return prom;
            }
            else {
                const errObj = Object.assign({ response }, requestInfo);
                let resInterceptorRejectPromise = Promise.reject(errObj);
                resInterceptor.store.forEach(item => {
                    resInterceptorRejectPromise = resInterceptorRejectPromise
                        .catch(err => (item.onRejected ? item.onRejected(err) : Promise.reject(err)))
                        .then(res => checkInterceptorsReturn(res, 'response', errObj));
                });
                return resInterceptorRejectPromise;
            }
        }, err => {
            const errObj = Object.assign({ err }, requestInfo);
            let reqInterceptorRejectPromise = Promise.reject(errObj);
            reqInterceptor.store.forEach(item => {
                reqInterceptorRejectPromise = reqInterceptorRejectPromise
                    .catch(err => (item.onRejected ? item.onRejected(err) : Promise.reject(err)))
                    .then(res => checkInterceptorsReturn(res, 'request', errObj));
            });
            return reqInterceptorRejectPromise;
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

var index = new Service();

export { index as default };
//# sourceMappingURL=ja-fetch.js.map
