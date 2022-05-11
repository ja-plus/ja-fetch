/** ************
 * fetch 包装
 * TODO: timeout
 * 取消请求可使用abortController()
 ***********/

import coreFetch from './coreFetch.js'
import Service from './service.js'

/**
 *
 * @param {string} type get post put delete
 * @param {string} url
 * @param {object} config
 * @returns
 */
function _requestAdapter(type, url, config = {}) {
  config.method = type
  const responseType = config.responseType
  return coreFetch(url, config).then(response => {
    if (response.ok) {
      if (responseType === 'blob') return response.blob()
      if (responseType === 'text') return response.text()
      if (responseType === 'arraybuffer') return response.arrayBuffer()
      if (responseType === 'response') return response // response.body
      return response.json()
    } else {
      return Promise.reject({
        msg: `res status:${response.status}`,
        res: response,
      })
    }
  })
}
/**
 * @param {string} url
 * @param {object} config
 * @returns
 */
function _get(url, config) {
  return _requestAdapter('GET', url, config)
}
/**
 * @param {string} url
 * @param {object} config
 * @returns
 */
function _post(url, config) {
  return _requestAdapter('POST', url, config)
}
/**
 * @param {string} url
 * @param {object} config
 * @returns
 */
function _put(url, config) {
  return _requestAdapter('PUT', url, config)
}
/**
 * @param {string} url
 * @param {object} config
 * @returns
 */
function _del(url, config) {
  return _requestAdapter('DELETE', url, config)
}

/**
 *
 * @param {object} defaultConfig
 * @returns {Service}
 */
function _create(defaultConfig) {
  return new Service(defaultConfig)
}

export { _get as get }
export { _post as post }
export { _put as put }
export { _del as del }
export { _create as create }
export default {
  create: _create,
  get: _get,
  post: _post,
  put: _put,
  del: _del,
}
