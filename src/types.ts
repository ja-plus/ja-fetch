export type ResponseType = 'text' | 'blob' | 'arraybuffer' | 'response';

export interface JaFetchRequestInit<T = ResponseType> extends RequestInit {
  /**not JSON.stringify(body) */
  rawBody?: boolean;
  /**基本url */
  baseURL?: string;
  /**url请求参数 */
  params?: any;
  responseType?: T;
  body?: any | BodyInit;
  /**可在init中传任意自定义字段 */
  [k: string]: any;
}

export type JaRequestInfo = {
  url: string;
  init: JaFetchRequestInit;
};
