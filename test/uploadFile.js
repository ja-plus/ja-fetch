import http from '../lib/ja-fetch.esm.js';
import h from './h.js';
/**@type {HTMLElement}*/
let uploadFileBtn = h('button', 'uploadFile');
uploadFileBtn.addEventListener('click', fetch);
document.body.appendChild(uploadFileBtn);

const formData = new FormData();
formData.append('file', new File(['hello world'], 'file.txt', { type: 'text/plain' }));
formData.append('text', 'hello');
function fetch() {
  http
    .post('http://localhost:8080/uploadFile', {
      params: { type: 'post' },
      body: formData,
    })
    .then(res => {
      console.log('uploadFile OK :', res);
    });
}
fetch();
