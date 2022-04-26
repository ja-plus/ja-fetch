# ja-fetch
## use
### basic
```javascript
import jafetch from "ja-fetch";
// get
jafetch.get(url, {
    params: { type: "aa", data: "ddd" },
    mode: "cors",
    // credentials: 'include',
    // responseType: 'text'
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
### interceptor
```javascript
import jafetch from "../js/utils/jafetch.js";
const Service = jafetch.create({
    mode: "cors",
    // credentials: 'include' // cookie
});

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