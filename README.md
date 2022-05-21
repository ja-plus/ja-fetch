# ja-fetch
A simple fetch wrapper (uglify:**3kb**)
* Optimize fetch: get transfer parameters
* Optimize fetch: Auto JSON.stringify post body
* default return `response.json()` (Set `responseType` to change)
* support interceptor
* support cancel request interceptor preset

config extends [Fetch API(MDN)](https://developer.mozilla.org/zh-CN/docs/Web/API/Fetch_API/Using_Fetch)

## API
```javascript
jafetch.get(url, config)
let service = jafetch.create(config)
service.interceptors.request.use(onFulfilled,onRejected)
service.interceptors.response.use(onFulfilled,onRejected)
service.interceptors.use(preset)
service.get(url,config)
```
## Usage Demo
### Basic usage
```javascript
import jafetch from "ja-fetch";
// get
jafetch.get(url, {
    params: { type: "aa", data: "ddd" },
    mode: "cors",
    // credentials: 'include',
    // responseType: 'text'
    // responseType: 'response' // return raw fetch Response Object
})
// post
jafetch.post(url, {
    params: { id: "11" }, // Concatenated after the URL
    body: { type: "json" },
    mode: "cors",
})
// formData
let formData = new FormData();
    formData.append("type", "formData");

jafetch.post(url, {
    params: { id: "11" },
    body: formData,
    mode: "cors",
})
// put 
jafetch.put(url, {
    params: { id: "pp" },
    body: { type: "put" },
    mode: "cors",
})
// delete
jafetch.del(url, {
    params: { id: "del" },
    body: { type: "delete" },
    mode: "cors",
})
```
### Interceptor demo
```javascript
import jafetch from "ja-fetch";
const Service = jafetch.create({
    mode: "cors",
    // credentials: 'include' // cookie
    // responseType: 'text'
});
// request
Service.interceptors.request.use(
    (url, config) => {
        config.headers.userToken = "11111";
        return config;
    },
    (err) => {
        console.log("request interceptor err:", err);
        return Promise.reject(err);
    }
);
// response
Service.interceptors.response.use(
    (data, { url, config }) => {
        if (data.code === 1) {
            console.log(data, config, "response interceptor: ok");
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
```
### Cancel Request Demo
Use [AbortController(MDN)](https://developer.mozilla.org/zh-CN/docs/Web/API/AbortController) to cancel request  (`Chrome >= 66`)
#### Basic
```javascript 
import jafetch from 'ja-fetch';
const fetchBtn = document.querySelector('#fetch'); // <button></button>
let controller; // save request abortController

fetchBtn.addEventListener('click', () => {
    if (controller) controller.abort(); // abort a request

    controller = new AbortController();
    jafetch.get('http://localhost:8080/timeoutTestData', { 
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
  import jafetch from "ja-fetch";
  let Service = jafetch.create();
  let cacheArr = [];
  Service.interceptors.request.use((url, config) => {
    cacheArr.forEach((item) => {
      // abort same url
      if (item.url === url) {
        item.controller.abort();
        item.canceled = true;
      }
    });
    let abController = new AbortController();
    config.signal = abController.signal;
    cacheArr.push({
      url,
      controller: abController,
      cancel: false,
    });
  });
  Service.interceptors.response.use((data, { url, config }) => {
    cacheArr = cacheArr.filter((item) => !item.canceled); // clean canceled cache
  });
```
#### Use Cancel Request Preset
```javascript
  import jafetch from 'ja-fetch'
  import { commonCancelRequest } from 'ja-fetch/preset/interceptors.js'
  let ServiceAB = jafetch.create()
  ServiceAB.interceptors.use(commonCancelRequest()) //
  // or custom cancel rule
  ServiceAB.interceptors.use(
    commonCancelRequest((storedRequest, nowRequest) => {
    /**
     * @typedef storedRequest / nowRequest
     * @property {string} url
     * @property {object} config 
     */
      return storedRequest.url === nowRequest.url
    }, {
        notCancelKey: 'notCancel',
        gcCacheArrNum: 20, // 数组大于该值，则去除数组中已返回的请求
    }),

    // let a request not be canceled
    ServiceAB.get(url, {param, notCancel: true})
  )
```