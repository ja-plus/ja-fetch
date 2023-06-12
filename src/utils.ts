/**
 * 拼接url参数
 * @param {string} url
 * @param {Object} params url param object
 * @returns {string}
 */
export function createUrlParamStr(url: string, params: any) {
  const tmpUrl = new URL(url, window.location.origin);
  for (const key in params) {
    if (Object.hasOwnProperty.call(params, key)) {
      const val = params[key];
      if (val === undefined || val === null) continue;
      tmpUrl.searchParams.append(key, val);
    }
  }
  return tmpUrl.href;
}

const enum Type {
  request = 0,
  response = 1,
}
/**
 * check interceptors onRejected function's return
 * @param {any} rejectedFuncReturn
 * @param {Type} type
 * @returns
 */
export function checkInterceptorsReturn(rejectedFuncReturn: any, type: Type) {
  if (rejectedFuncReturn instanceof Promise) {
    return rejectedFuncReturn;
  } else {
    // if not Promise, show warn
    console.warn(`${type === 0 ? 'request' : 'response'}.interceptor.use(onFulfilled, onRejected): onRejected not return Promise.`);
    return Promise.reject(rejectedFuncReturn);
  }
}
