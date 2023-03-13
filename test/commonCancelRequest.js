/* test interceptor commonCancelRequest*/
import http from '../lib/ja-fetch.js';
import { commonCancelRequest } from '../preset/interceptors.js';
import h from './h.js';
let ServiceAB = http.create();
ServiceAB.interceptors.use(
  commonCancelRequest(
    (storedRequest, nowRequest) => {
      return storedRequest.url === nowRequest.url;
    },
    { notInterceptKey: '__not_cancel__' },
  ),
);

const fetchBtn = h('button', 'fetch');
document.querySelector('#commonCancelRequest').append(fetchBtn);
fetchBtn.addEventListener('click', () => {
  console.log('commonCancelRequest 发起fetch 请求... 1s后返回结果');
  ServiceAB.get('http://localhost:8080/timeoutTestData', {
    params: { timeout: 1000 },
    // notCancel: true,
    // __not_cancel__: true,
  })
    // ServiceAB.get('http://localhost:8080/setStatusCode', {
    //   params: { code: 502 },
    // })
    .then(response => {
      console.log('commonCancelRequest fetch response :>> ', response);
    })
    .catch(err => {
      console.warn('commonCancelRequest fetch请求失败', err);
    });
});
