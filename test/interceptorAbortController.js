/* test interceptor abortController*/
import http from '../lib/ja-fetch.js';
import h from './h.js';
let cacheArr = [];
const service = http.create();
service.interceptors.request.use((url, init) => {
  cacheArr.forEach(item => {
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
    canceled: false,
  });
  return init;
});

service.interceptors.response.use(data => {
  cacheArr = cacheArr.filter(item => !item.canceled); // 仅保留未清除的,对象回收
  // return data;
});

const fetchBtn = h('button', 'fetch');
const abortBtn = h('button', 'AbortController');
document.querySelector('#interceptorAbortController').append(fetchBtn, abortBtn);
fetchBtn.addEventListener('click', () => {
  console.log('发起fetch 请求... 4s后返回结果');
  service
    .get('http://localhost:8080/timeoutTestData', {
      params: { timeout: 4000 },
    })
    .then(response => {
      console.log('interceptor AbortController fetch response :>> ', response);
    })
    .catch(err => {
      console.warn('interceptor AbortController fetch请求已被取消', err);
    });
});
abortBtn.addEventListener('click', () => {
  console.log('interceptor AbortController 使用AbortController 取消所有请求');
  cacheArr.forEach(item => {
    item.controller.abort();
  });
});
