/**
 * 拼接url参数
 * @param {string} url url字符串
 * @param {Object} params url参数对象
 * @returns {string}
 */
export function createUrlParamStr(url, params) {
  let tmpUrl = new URL(url, window.location) // 如果是url是相对路径，则会加上第二个参数
  for (const key in params) {
    tmpUrl.searchParams.append(key, params[key])
  }
  return tmpUrl.href
}
