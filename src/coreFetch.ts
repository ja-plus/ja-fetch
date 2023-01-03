import { JaFetchRequestInit } from './service.js';
import { createUrlParamStr } from './utils.js';

/**
 * TODO: 判断url类型
 * @param {string | URL} url url
 * @param {JaFetchRequestInit} init fetch init obj
 * @returns {Promise<Response>}
 */
export default function coreFetch(url: string, init: JaFetchRequestInit) {
  // add url param
  const params = init.params;
  if (params) url = createUrlParamStr(url, params);

  if (!init.rawBody) {
    // init.body is object, not FormData
    if (typeof init.body === 'object' && !(init.body instanceof FormData)) {
      init.headers = {
        'Content-Type': 'application/json',
        ...(init.headers || {}),
      };
      try {
        init.body = JSON.stringify(init.body);
      } catch (e) {
        throw new Error('cannot stringify body json');
      }
    }
  }
  if (!init.credentials) init.credentials = 'same-origin'; // 自 2017 年 8 月 25 日以后，默认的 credentials 政策变更为 same-origin

  return fetch(url, init);
}
