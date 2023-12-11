// multi interceptors
import http from '../lib/ja-fetch.esm.js';
import h from './h.js';
const Service = http.create();

/**增加一个请求拦截器*/
Service.interceptors.request.use(
  (url, init) => {
    init.headers.HAHAHA = '1';
    return init;
  },
  (err, requestInfo) => {
    console.log('request multi interceptor err1', err, ' requestInfo:', requestInfo);
    // return Promise.resolve() // will not jump to next interceptors.request onRejected func
    return Promise.reject(err); // will jump to next
  },
);
/**第二个请求拦截器*/
Service.interceptors.request.use(
  (url, init) => {
    init.headers.HAHAAH2 = '2';
    return init;
  },
  (err, requestInfo) => {
    console.log('request multi interceptor err2', err, ' requestInfo:', requestInfo);
    // return Promise.reject(err) // will jump to jafetch.xxx().catch()
    // return Promise.resolve() // will jump to jafetch.xxx().then()
  },
);

/**响应拦截器*/
Service.interceptors.response.use(
  (data, requestInfo, response) => {
    console.log('response multi interceptor1 data:', data, ' requestInfo:', requestInfo, ' response:', response);
    data.addKey1 = 2;
    data.a.a; // throw error
    return data;
    // return Promise.reject('aaa');
  },
  (err, requestInfo, response) => {
    console.log('response multi interceptor1 err:', err, ' requestInfo:', requestInfo, ' response:', response);
    return Promise.reject(err);
  },
);
/**第二个响应拦截器*/
Service.interceptors.response.use(
  (data, requestInfo, response) => {
    console.log('response multi interceptor2 data:', data, ' requestInfo:', requestInfo, ' response:', response);
    data.addKey2 = 2;
    return data;
    // return Promise.reject('aaaa')
  },
  (err, requestInfo, response) => {
    console.log('response multi interceptor2 err:', err, ' requestInfo:', requestInfo, ' response:', response);
    return Promise.reject(err);
    // return Promise.resolve('1')
  },
);

Service.get('http://localhost:8080/getTestData', {
  params: { type: 'aa' },
  // mode: 'cors',
})
  .then(res => {
    console.log('multi interceptor get: ok', res);
    document.body.append(h('p', 'multi interceptor GET: ok,' + JSON.stringify(res)));
  })
  .catch(err => {
    console.error('multi interceptor get: err', err);
    document.body.append(h('p', 'multi interceptor GET: err,' + JSON.stringify(err)));
  });
