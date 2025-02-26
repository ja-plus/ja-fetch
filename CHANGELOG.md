## 1.6.1
* fix: `commonCancelRequest` and `commonTimeRequest`, which create AbortController will cover user's signal. Now users signal first.
* feature: `commonCancelRequest` and `commonTimeRequest`, support `AbortSignal.any` to receive several abort event.
## 1.6.0
* optimize: rewrite some code to reduce code size

## 1.5.2
* fix: `AbortController.abort` add `AbortController.reason` 

## 1.5.1
* fix: preset interceptors cjs
## 1.5.0
* default support commonjs
    * package.json `main` "lib/ja-fetch.min.js" -> "lib/ja-fetch.js",
    * package.json `module` "lib/ja-fetch.esm.js"
## 1.4.2
* fix: `commonCancelRequest`,`commonThrottleRequest` param ts hint
## 1.4.1
* change: `get` set param `undefined` will be ignored
## 1.4.0
* change: `preset/interceptors/index` => `preset/interceptors.js`
* add: `commonParallelRequest`, `commonTimeoutRequest`
* feat: interceptors.request.use callback support promise
* fix: interceptors reject err obj.
* add: request interceptor onReject param `requestConfig:{url:string,init:JaFetchRequestInit}`
* add: response interceptor onReject param `requestConfig:{url:string,init:JaFetchRequestInit}, response:Response`
## 1.3.8
* fix: type `JaFetchRequestInit` support custom key
## 1.3.7
* add: tsconfig `strict: true`
* fix: get params undefined
## 1.3.6
add: jafetch.get/post/put/del/request<T> template
remove: build `tsc -d --declarationDir types --emitDeclarationOnly`
fix: preset type
## 1.3.5
add: service support `baseURL`
add: init attr `rawBody` -> Not auto JSON.stringify(body)
fix: interceptor.use `param`
## 1.3.4
update: `README.md`
update: `package.json` main to ja-fetch.min.js
## 1.3.3
update: `commonCancelRequest`,`commonThrottleRequest` -> `abortFilter` param order.
add: `preset/interceptors` type declare
add: `commonCancelRequest` support browser without `AbortController`
## 1.3.2
fix: jafetch.create parameter not a must
fix: `interceptors.request.use`, `interceptors.response.use` parameter optional, not must
add: enhance `interceptors.use` function can pass the Interceptors type
fix: `interceptor.remove` optional parameter,not must
## 1.3.1
* fixe: package.json files add types folder 
## 1.3.0
* rebuild: `typescript`
* fix: get method - parameter append to url error
* fix: `commonCancelRequest` set notInterceptKey not work 
* fix: `commonThrottleRequest` set notInterceptKey not work 
## 1.2.4
* change: preset/interceptors as a folder
* fix: `commonThrottleRequest` not work correctly when request error
* fix: `commonThrottleRequest` set notThrottle=true not work
* fix: `commonThrottleRequest` requestId of null bug in cacheArr_clean function
* add: service.request() function which can custom method
## 1.2.3
* add: interceptors preset `commonThrottleRequest`
## 1.2.2
* pack lib 1.2.1 ...
## 1.2.1
* change: interceptors.response onFulfilled function parameter (data, config, response) => (data, {url, config}, response)
* update: interceptors preset
## 1.2.0
* add: interceptors.use
* add: interceptors preset `commonCancelRequest`
## 1.1.0
* add: multi interceptors