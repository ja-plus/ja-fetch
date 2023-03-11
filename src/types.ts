export interface JaFetchRequestInit extends RequestInit {
  /**not JSON.stringify(body) */
  rawBody?: boolean;
  /**基本url */
  baseURL?: string;
  /**url请求参数 */
  params?: any;
  responseType?: 'text' | 'blob' | 'arraybuffer' | 'response';
  body?: any | BodyInit;
  /**可在init中传任意自定义字段 */
  [k: string]: any;
}
