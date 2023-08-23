import Interceptors from '@/interceptors';

type Option = {
  /**parallel size */
  ms?: number;
};
/**超时 */
export default function commonTimeoutRequest(option: Option = {}) {
  const { ms = 30000 } = option;

  return {
    install(interceptors: Interceptors) {
      interceptors.request.use((url, init) => {
        const abortController = new AbortController();
        init.signal = abortController.signal;
        const _commonTimeoutRequest = {
          controller: abortController,
          timeout: window.setTimeout(() => {
            abortController.abort();
            console.warn(`commonTimeoutRequest: timeout(${ms}). url:${url}, init:`, init);
          }, ms),
        };
        init._commonTimeoutRequest = _commonTimeoutRequest;
        return init;
      });

      interceptors.response.use(
        (data, { init }) => {
          window.clearTimeout(init._commonTimeoutRequest.timeout);
          return data;
        },
        err => {
          window.clearTimeout(err.init._commonTimeoutRequest.timeout);
          return Promise.reject(err);
        },
      );
    },
  };
}
