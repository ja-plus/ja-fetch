/* -------basic request---------------*/
import http from '../lib/ja-fetch.esm.js';
import h from './h.js';
let service = http.create({ baseURL: 'http://localhost:8080' });
service
  .request('/getTestData', {
    method: 'GET',
    params: { type: 'aa', data: '1,2,3,4,5', undef: undefined, nul: null },
    mode: 'cors',
  })
  .then(res => {
    console.log('request get: ok', res);
    document.body.append(h('p', 'request GET: ok,' + JSON.stringify(res)));
  });
service
  .get('/getTestData', {
    params: { type: 'aa', data: 'ddd' },
    mode: 'cors',
    // credentials: 'include',
    // responseType: 'text'
  })
  .then(res => {
    console.log('get: ok', res);
    document.body.append(h('p', 'GET: ok,' + JSON.stringify(res)));
  });

service
  .post('/postTestData', {
    params: { id: '11' },
    body: { type: 'json' },
    mode: 'cors',
  })
  .then(res => {
    console.log('post json: ok', res);
    document.body.append(h('p', 'POST json: ok,' + JSON.stringify(res)));
  });

let formData = new FormData();
formData.append('type', 'formData');

service
  .post('/postTestData', {
    params: { id: '11' },
    body: formData,
    mode: 'cors',
  })
  .then(res => {
    console.log('post form data: ok', res);
    document.body.append(h('p', 'POST form data: ok,' + JSON.stringify(res)));
  });

service
  .put('/putTestData', {
    params: { id: 'pp' },
    body: { type: 'put' },
    mode: 'cors',
  })
  .then(res => {
    console.log('put json: ok', res);
    document.body.append(h('p', 'PUT json: ok,' + JSON.stringify(res)));
  });

service
  .del('/delTestData', {
    params: { id: 'del' },
    body: { type: 'delete' },
    mode: 'cors',
  })
  .then(res => {
    console.log('delete : ok', res);
    document.body.append(h('p', 'DELETE : ok,' + JSON.stringify(res)));
  });
