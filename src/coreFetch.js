import { createUrlParamStr } from "./utils";

/**
 * @param {string} url url
 * @param {object} config fetch init obj
 * @returns {Promise<Response>}
 */
export default function coreFetch(url, config) {
    const params = config.params;
    // 拼url参数
    if (params) url = createUrlParamStr(url, params);

    if (config.body) {
        // conf.body is object
        if (!(config.body instanceof FormData) && typeof config.body === 'object') {
            config.headers = Object.assign(
                {
                    'Content-Type': 'application/json',
                },
                config.headers || {},
            );
            try {
                config.body = JSON.stringify(config.body);
            } catch (e) {
                throw new Error('cannot stringify body json');
            }
        }
    }
    if (!config.credentials) config.credentials = 'same-origin'; // 自 2017 年 8 月 25 日以后，默认的 credentials 政策变更为 same-origin

    return fetch(url, config);
}