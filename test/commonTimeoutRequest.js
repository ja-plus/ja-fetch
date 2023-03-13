import http from '../lib/ja-fetch.js';
import { commonTimeoutRequest } from '../preset/interceptors.js';
import h from './h.js';
let serviceTimeout = http.create();
serviceTimeout.interceptors.use(commonTimeoutRequest({ ms: 3000 }));

const timeoutFetchBtn = h('button', 'timeoutFetch');
document.querySelector('#commonTimeoutRequest').append(timeoutFetchBtn);
timeoutFetchBtn.addEventListener('click', () => {
  serviceTimeout
    .get('http://localhost:8080/timeoutTestData', {
      params: { timeout: 5000 },
    })
    .then(response => {
      console.log('commonTimeoutRequest fetch response :>>', response);
    })
    .catch(err => {
      console.warn('commonTimeoutRequest fetch 请求失败：', err);
    });
});
