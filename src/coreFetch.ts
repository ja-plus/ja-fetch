import type { JaFetchRequestInit } from './types.js';
import { createUrlParamStr } from './utils.js';

/**
 * TODO: 判断url类型
 * @param {string | URL} url url
 * @param {JaFetchRequestInit} init fetch init obj
 * @returns {Promise<Response>}
 */
export default function coreFetch(url: string, init: JaFetchRequestInit) {
  const { params, rawBody, body, headers, credentials } = init;
  // add url param
  if (params) url = createUrlParamStr(url, params);

  if (!rawBody) {
    // init.body is object, not FormData
    if (typeof body === 'object' && !(body instanceof FormData)) {
      init.headers = {
        'Content-Type': 'application/json',
        ...headers,
      };
      init.body = JSON.stringify(body);
    }
  }
  if (!credentials) init.credentials = 'same-origin'; // 自 2017 年 8 月 25 日以后，默认的 credentials 政策变更为 same-origin

  return fetch(url, init);
}
