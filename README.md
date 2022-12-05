# ja-fetch
A simple fetch wrapper, refer to some `axios API`. (parsed:**3KB**)
* Optimize fetch: method `"get"`, set `params` to transfer parameters.
* Optimize fetch: Auto JSON.stringify `post` body.
* default return `response.json()`. (Set `responseType` to change)
* support interceptor.
* support cancel request interceptor preset.

RequestInit extends [Fetch API(MDN)](https://developer.mozilla.org/zh-CN/docs/Web/API/Fetch_API/Using_Fetch)

## TODO
* getPendingPromiseList
## API
```javascript
import http from 'ja-fetch';
http.get(url[, init]);
let service = http.create([init]);
service.interceptors.request.use(onFulfilled[, onRejected]);
service.interceptors.response.use(onFulfilled[, onRejected]);
service.interceptors.use(preset);
service.get(url[, init]);
```
## Usage Demo
### Basic usage
```javascript
import http from "ja-fetch";
http.request(url, {
    method: 'GET',// POST PUT DELETE
    params: { type: "aa", data: "ddd" },
    mode: "cors",
})
// get
http.get(url, {
    params: { type: "aa", data: "ddd" },
    mode: "cors",
    // credentials: 'include',
    // responseType: 'text' | 'arraybuffer' | 'blob' | 'json' 
    // responseType: 'response' // return raw fetch Response Object
})
// post
http.post(url, {
    params: { id: "11" }, // Concatenated after the URL
    body: { type: "json" },
})
// formData
let formData = new FormData();
    formData.append("type", "formData");

http.post(url, {
    params: { id: "11" },
    body: formData,
})
// put 
http.put(url, {
    params: { id: "pp" },
    body: { type: "put" },
})
// delete
http.del(url, {
    params: { id: "del" },
    body: { type: "delete" },
})
```
### Interceptor demo
```javascript
import http from "ja-fetch";
const Service = http.create({
  mode: "cors",
    // baseURL: 'http://xxx',
    // credentials: 'include' // cookie
    // responseType: 'text' | 'arraybuffer' | 'blob' | 'json' | 'response'
});
// request
Service.interceptors.request.use(
    (url, init) => {
        init.headers.userToken = "11111";
        return init;
    },
    (err) => {
        console.log("request interceptor err:", err);
        return Promise.reject(err);
    }
);
// response
Service.interceptors.response.use(
    (data, { url, init }) => {
        if (data.code === 1) {
            console.log(data, init, "response interceptor: ok");
            return data;
        } else {
            return Promise.reject("response.data.code is " + data.code);
        }
    },
    (err) => {
        console.log("response interceptor err:", err);
        return Promise.reject(err);
    }
);

// use interceptor
service.interceptors.use({
  install(interceptor){
    interceptor.request.use(/*... */)
    interceptor.response.use(/*... */)
  }
})
```
### Cancel Request Demo
Use [AbortController(MDN)](https://developer.mozilla.org/zh-CN/docs/Web/API/AbortController) to cancel request  (`Chrome >= 66`)
#### Basic
```javascript 
import http from 'ja-fetch';
const fetchBtn = document.querySelector('#fetch'); // <button></button>
let controller; // save request abortController

fetchBtn.addEventListener('click', () => {
    if (controller) controller.abort(); // abort a request

    controller = new AbortController();
    http.get('http://localhost:8080/timeoutTestData', { 
        params: { timeout: 4000 }, 
        signal: controller.signal
    }).then(data => {
        console.log('data', data)
    }).catch(err => {
        console.warn('fetch canceled', err);
    }).finally(() => {
      controller = null
    });
});


```
#### In interceptors
```javascript
  import http from "ja-fetch";
  let Service = http.create();
  let cacheArr = [];
  Service.interceptors.request.use((url, init) => {
    cacheArr.forEach((item) => {
      // abort same url
      if (item.url === url) {
        item.controller.abort();
        item.canceled = true;
      }
    });
    let abController = new AbortController();
    init.signal = abController.signal;
    cacheArr.push({
      url,
      controller: abController,
      cancel: false,
    });
  });
  Service.interceptors.response.use((data, { url, init }) => {
    cacheArr = cacheArr.filter((item) => !item.canceled); // clean canceled cache
  });
```
#### Use Cancel Request Preset
```javascript
  import http from 'ja-fetch'
  import { commonCancelRequest, commonThrottleRequest } from 'ja-fetch/preset/interceptors'
  let ServiceAB = http.create()
  ServiceAB.interceptors.use(commonCancelRequest()) // url === url && method === method
  // let a request not be canceled
  ServiceAB.get(url, {param, notCancel: true})
```
or custom cancel rule
```javascript
  ServiceAB.interceptors.use(
    commonCancelRequest((nowRequest, storedRequest) => {
    /**
     * @typedef storedRequest / nowRequest
     * @property {string} url
     * @property {RequestInit} init 
     */
      return storedRequest.url === nowRequest.url
    }, {
        notCancelKey: 'notCancel',
        gcCacheArrNum: 20, // 数组大于该值，对数组中的元素进行回收
    }),

    // let a request not be canceled
    ServiceAB.get(url, {param, notCancel: true})
  )
```

## About project 
* node > 16