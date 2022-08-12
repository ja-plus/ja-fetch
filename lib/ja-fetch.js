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

function __classPrivateFieldGet(receiver, privateMap) {
    if (!privateMap.has(receiver)) {
        throw new TypeError("attempted to get private field on non-instance");
    }
    return privateMap.get(receiver);
}

function __classPrivateFieldSet(receiver, privateMap, value) {
    if (!privateMap.has(receiver)) {
        throw new TypeError("attempted to set private field on non-instance");
    }
    privateMap.set(receiver, value);
    return value;
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

var _Service_instances, _Service_defaultConf;
class Service {
    constructor(defaultConf) {
        _Service_instances.add(this);
        _Service_defaultConf.set(this, {
            headers: {},
        });
        this.interceptors = new Interceptors();
        __classPrivateFieldSet(this, _Service_defaultConf, Object.assign({}, __classPrivateFieldGet(this, _Service_defaultConf), defaultConf));
    }
    create(config) {
        return new Service(config);
    }
    request(url, config = {}) {
        return __classPrivateFieldGet(this, _Service_instances).call(this, url, config);
    }
    get(url, config = {}) {
        config.method = 'GET';
        return __classPrivateFieldGet(this, _Service_instances).call(this, url, config);
    }
    post(url, config = {}) {
        config.method = 'POST';
        return __classPrivateFieldGet(this, _Service_instances).call(this, url, config);
    }
    put(url, config = {}) {
        config.method = 'PUT';
        return __classPrivateFieldGet(this, _Service_instances).call(this, url, config);
    }
    del(url, config = {}) {
        config.method = 'DELETE';
        return __classPrivateFieldGet(this, _Service_instances).call(this, url, config);
    }
}
_Service_defaultConf = new WeakMap(), _Service_instances = new WeakSet();

var index = new Service();

export { index as default };
