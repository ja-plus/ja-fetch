/* test abortController*/
import http from '../lib/ja-fetch.js';
import h from './h.js';
const fetchBtn = h('button', 'fetch');
const abortBtn = h('button', 'AbortController');
document.querySelector('#testAbortController').append(fetchBtn, abortBtn);
let controller;
fetchBtn.addEventListener('click', () => {
  if (controller) {
    controller.abort();
    console.log('取消上次请求');
  }
  console.log('abortController 发起fetch 请求... 4s后返回结果');
  controller = new AbortController();
  http
    .get('http://localhost:8080/timeoutTestData', {
      params: { timeout: 4000 },
      signal: controller.signal,
    })
    .then(response => {
      console.log('abortController fetch response :>> ', response);
    })
    .catch(err => {
      console.warn('abortController fetch请求已被取消', err);
    });
});
abortBtn.addEventListener('click', () => {
  if (!controller) {
    console.warn('abortController 请先发起请求');
    return;
  }
  console.log('abortController 使用AbortController 取消请求');
  controller.abort();
});
