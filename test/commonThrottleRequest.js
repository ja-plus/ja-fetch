/* test interceptor throttle */
import http from '../lib/ja-fetch.esm.js';
import { commonThrottleRequest } from '../preset/interceptors.js';
import h from './h.js';
let ServiceAB = http.create();
ServiceAB.interceptors.use(commonThrottleRequest(null, { notInterceptKey: '__not_throttle__' }));

const fetchBtn = h('button', 'fetch');
document.querySelector('#commonThrottleRequest').append(fetchBtn);
fetchBtn.addEventListener('click', () => {
  console.log('commonThrottleRequest 发起fetch 请求... 1s后返回结果');
  ServiceAB.get('http://localhost:8080/timeoutTestData', {
    params: { timeout: 1000 },
    notThrottle: true,
    // __not_throttle__: true,
  })
    // ServiceAB.get('http://localhost:8080/setStatusCode', {
    //   params: { code: 500 },
    // })
    .then(response => {
      console.log('commonThrottleRequest fetch response :>> ', response);
    })
    .catch(err => {
      console.warn('commonThrottleRequest fetch 请求失败：', err);
    });
});
