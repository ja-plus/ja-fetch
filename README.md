# ja-fetch
A fetch wrapper 
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
    params: { id: "11" },
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
    (data, conf) => {
        if (data.code === 1) {
            console.log(data, conf, "response interceptor: ok");
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
  Service.interceptors.response.use((url, config) => {
    cacheArr = cacheArr.filter((item) => !item.canceled); // clean canceled cache
  });
```