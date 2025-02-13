import Interceptors from '@/interceptors';

type Option = {
  /**timeout ms */
  ms?: number;
};
/**超时 */
export default function commonTimeoutRequest(option: Option = {}) {
  const { ms = 30000 } = option;

  return {
    install(interceptors: Interceptors) {
      interceptors.request.use((url, init) => {
        const abortController = init.abortController || new AbortController();
        if (init.signal) {
          // if user has set signal, use user's signal
          // chrome 116 can use AbortSignal.any
          if (AbortSignal.any) {
            init.signal = AbortSignal.any([init.signal, abortController.signal]);
          }
        } else {
          init.signal = abortController.signal;
        }
        const _commonTimeoutRequest = {
          controller: abortController,
          timeout: window.setTimeout(() => {
            const msg = `commonTimeoutRequest: timeout(${ms}). url:${url}`;
            abortController.abort(msg);
            console.warn(msg);
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
