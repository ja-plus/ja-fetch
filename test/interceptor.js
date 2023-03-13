/* ------------interceptors-----------------*/
import http from '../lib/ja-fetch.js';
import h from './h.js';
const Service = http.create({
  mode: 'cors',
  // credentials: 'include' // cookie
});

Service.interceptors.request.use(
  (url, init) => {
    init.headers.userToken = '11111';
    return init;
  },
  (err, requestInfo) => {
    console.log('request interceptor err:', err, 'requestInfo:', requestInfo);
    return Promise.reject(err);
  },
);

Service.interceptors.response.use(
  (data, requestInfo, response) => {
    if (data.code === 1) {
      console.log('response interceptor: ok', 'data:', data, 'requestInfo:', requestInfo, 'response:', response);
      document.body.append(h('p', 'response interceptor: ok,' + JSON.stringify(data)));
      return data;
    } else {
      return Promise.reject('response.data.code is ' + data.code);
    }
  },
  (err, requestInfo, response) => {
    console.log('response interceptor err:', err, 'requestInfo:', requestInfo, 'response:', response);
    return Promise.reject(err);
  },
);
Service.get('http://localhost:8080/getTestData', {
  params: { type: 'aa' },
  mode: 'cors',
  // credentials: 'include',
  // responseType: 'text'
})
  .then(res => {
    console.log('interceptor get: ok', res);
    document.body.append(h('p', 'interceptor GET: ok,' + JSON.stringify(res)));
  })
  .catch(err => {
    console.error('interceptor get: fail', err);
    document.body.append(h('p', 'interceptor GET: fail,' + JSON.stringify(err)));
  });
/** remove interceptor*/
// Service.interceptors.response.remove();

Service.post('http://localhost:8080/postTestData', {
  params: { type: 'post param' },
  headers: {
    // 'Content-Type': 'text/plain',
  },
  body: { type: 'post' },
  mode: 'cors',
  // credentials: 'include',
  // responseType: 'text'
})
  .then(res => {
    console.log('interceptor post: ok', res);
    document.body.append(h('p', ' interceptor POST: ok,' + JSON.stringify(res)));
  })
  .catch(err => {
    console.error('interceptor post: fail', err);
    document.body.append(h('p', 'interceptor POST: fail,' + JSON.stringify(err)));
  });

// Service.get('http://localhost:8080/timeoutTestData', {
//   params: {
//     timeout: 2000,
//   },
// })
//   .then(res => {
//     console.log('res', res);
//   })
//   .catch(err => {
//     console.log(err);
//   });
