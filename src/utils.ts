/**
 * 拼接url参数
 * @param {string} url url字符串
 * @param {Object} params url参数对象
 * @returns {string}
 */
export function createUrlParamStr(url: string, params: any) {
  const tmpUrl = new URL(url, window.location.origin); // 如果是url是相对路径，则会加上第二个参数
  for (const key in params) {
    if (Object.hasOwnProperty.call(params, key)) {
      let val = params[key];
      if (val === undefined) val = '';
      tmpUrl.searchParams.append(key, val);
    }
  }
  return tmpUrl.href;
}

/**
 * 检查interceptors onRejected 方法的返回
 * @param {any} rejectedFuncReturn
 * @param {'request' | 'response'} type
 * @param {object} errObj
 * @returns
 */
export function checkInterceptorsReturn(rejectedFuncReturn: any, type: 'request' | 'response', errObj: any) {
  // 校验onRejected 的返回值，希望onRejected 函数必须返回一个Promise
  if (rejectedFuncReturn instanceof Promise) {
    return rejectedFuncReturn;
  } else {
    console.warn(`${type}.interceptor.use(onFulfilled, onRejected): onRejected not return Promise.`);
    return Promise.reject(errObj);
  }
}
