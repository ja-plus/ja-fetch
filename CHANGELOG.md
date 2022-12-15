## 1.3.5
add: service support `baseURL`
add: init attr `rowBody` -> Not auto JSON.stringify(body)
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