/** `response` is private type */
export type ResponseType = 'response' | 'text' | 'blob' | 'arrayBuffer' | 'json' | 'formData';

export interface JaFetchRequestInit<T = ResponseType> extends RequestInit {
  /**not JSON.stringify(body) */
  rawBody?: boolean;
  /** base url add in front of url */
  baseURL?: string;
  /**url request param */
  params?: any;
  /**
   * response type default: json
   */
  responseType?: T;
  body?: any | BodyInit;
  /** custom */
  [k: string]: any;
}

export type JaRequestInfo = {
  url: string;
  init: JaFetchRequestInit;
};
