import http from '../lib/ja-fetch.esm.js';
import { commonParallelRequest } from '../preset/interceptors.js';
import h from './h.js';
let serviceParallel = http.create();
serviceParallel.interceptors.use(commonParallelRequest({ limit: 2 }));

const parallelFetchBtn = h('button', 'parallelFetch');
document.querySelector('#commonParallelRequest').append(parallelFetchBtn);
parallelFetchBtn.addEventListener('click', () => {
  console.log('commonParallelRequest 发起5个请求');
  for (let i = 0; i < 5; i++) {
    serviceParallel
      .get('http://localhost:8080/timeoutTestData', {
        params: { timeout: 5000 - i * 1000, q: i },
      })
      .then(response => {
        console.log('commonParallelRequest fetch response :>>', response);
      })
      .catch(err => {
        console.warn('commonParallelRequest fetch 请求失败：', err);
      });
  }
});
