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