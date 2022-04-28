class Interceptor {
    /** @type {Array<{id:string,onFulfilled:function,onRejected:function}>} */
    // store = [];
    /** @type {Function} */
    onFulfilled = null;
    /** @type {Function} */
    onRejected = null;
    use(onFulfilled, onRejected) {
        if (onFulfilled && typeof onFulfilled !== 'function') {
            throw new TypeError('interceptor.add(onFulfilled, onRejected), parameter onFulfilled is not a function');
        }
        if (onRejected && typeof onRejected !== 'function') {
            throw new TypeError('interceptor.add(onFulfilled, onRejected), parameter onRejected is not a function');
        }
        this.onFulfilled = onFulfilled;
        this.onRejected = onRejected;
    }
    remove() {
        this.onFulfilled = null;
        this.onRejected = null;
    }
}
export default class Interceptors {
    request = new Interceptor();
    response = new Interceptor();
}