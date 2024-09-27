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
      if (val === void 0 || val === null) continue;
      tmpUrl.searchParams.append(key, val);
    }
  }
  return tmpUrl.href;
}

/**
 * check interceptors onRejected function's return
 * @param {any} rejectedFuncReturn
 * @param {Type} type
 * @returns
 */
export function checkInterceptorsRejectCallbackReturn(rejectedFuncReturn: any) {
  return rejectedFuncReturn instanceof Promise ? rejectedFuncReturn : Promise.reject(rejectedFuncReturn);
}

// eslint-disable-next-line @typescript-eslint/ban-types
export function isFn(fn: unknown): fn is Function {
  return typeof fn === 'function';
}
