import Interceptors from '@/interceptors';
import type { JaFetchRequestInit } from '@/types';

type TaskCache = { url: string; init: JaFetchRequestInit; resolve: (init: JaFetchRequestInit) => void };
type Option = {
  /**parallel size */
  limit?: number;
};
/**请求并行队列 */
export default function commonParallelRequest(option: Option = {}) {
  const { limit = 5 } = option;

  let taskCount = 0;
  const taskList: TaskCache[] = [];
  /**Consume a task */
  function digestTask() {
    taskCount -= 1;
    const cachedRequest = taskList.shift();
    if (cachedRequest) {
      cachedRequest.resolve(cachedRequest.init);
      taskCount += 1;
    }
  }
  return {
    install(interceptors: Interceptors) {
      interceptors.request.use((url, init) => {
        if (taskCount < limit) {
          taskCount += 1;
          return init;
        }
        // add to task queue
        return new Promise(resolve => {
          const request = { url, init, resolve };
          taskList.push(request);
        });
      });

      interceptors.response.use(
        data => {
          digestTask();
          return data;
        },
        err => {
          digestTask();
          return Promise.reject(err);
        },
      );
    },
  };
}
