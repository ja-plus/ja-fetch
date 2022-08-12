function createUrlParamStr(url, params) {
    const tmpUrl = new URL(url, window.location.host);
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
        console.warn(`${type}.interceptor.use(onFulfilled, onRejected): onRejected function not return Promise. Use Promise.reject() to jump to next ${type} interceptor's onRejected Function`);
        return Promise.reject(errObj);
    }
}

function coreFetch(url, config) {
    const params = config.params;
    if (params)
        url = createUrlParamStr(url, params);
    if (config.body) {
        if (!(config.body instanceof FormData) && typeof config.body === 'object') {
            config.headers = Object.assign({
                'Content-Type': 'application/json',
            }, config.headers || {});
            try {
                config.body = JSON.stringify(config.body);
            }
            catch (e) {
                throw new Error('cannot stringify body json');
            }
        }
    }
    if (!config.credentials)
        config.credentials = 'same-origin';
    return fetch(url, config);
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
    use(obj) {
        const interceptors = new Interceptors();
        obj.install(interceptors);
        interceptors.request.store.forEach(item => {
            this.request.use(item.onFulfilled, item.onRejected);
        });
        interceptors.response.store.forEach(item => {
            this.response.use(item.onFulfilled, item.onRejected);
        });
    }
    create() {
        return new Interceptors();
    }
}

class Service {
    constructor(defaultConf) {
        this.defaultConf = {
            headers: {},
        };
        this.interceptors = new Interceptors();
        this.defaultConf = Object.assign({}, this.defaultConf, defaultConf);
    }
    create(config) {
        return new Service(config);
    }
    requestAdapter(url, config) {
        const reqInterceptor = this.interceptors.request;
        const resInterceptor = this.interceptors.response;
        let assignedConf = Object.assign({}, this.defaultConf, config);
        if (reqInterceptor.store.length) {
            if (!assignedConf.headers)
                assignedConf.headers = {};
            try {
                reqInterceptor.store.forEach(item => {
                    const returnConf = item.onFulfilled(url, assignedConf);
                    if (returnConf)
                        assignedConf = returnConf;
                });
            }
            catch (err) {
                return Promise.reject(err);
            }
        }
        const requestInfo = { url, config: assignedConf };
        return coreFetch(url, assignedConf).then(response => {
            if (response.ok) {
                const responseType = assignedConf.responseType;
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
    request(url, config = {}) {
        return this.requestAdapter(url, config);
    }
    get(url, config = {}) {
        config.method = 'GET';
        return this.requestAdapter(url, config);
    }
    post(url, config = {}) {
        config.method = 'POST';
        return this.requestAdapter(url, config);
    }
    put(url, config = {}) {
        config.method = 'PUT';
        return this.requestAdapter(url, config);
    }
    del(url, config = {}) {
        config.method = 'DELETE';
        return this.requestAdapter(url, config);
    }
}

var index = new Service();

export { index as default };
//# sourceMappingURL=ja-fetch.js.map
