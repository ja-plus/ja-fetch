import Interceptors from './interceptors';
export interface JaFetchRequestInit extends RequestInit {
    rawBody?: boolean;
    baseURL?: string;
    params?: any;
    responseType?: 'text' | 'blob' | 'arraybuffer' | 'response';
}
export default class Service {
    defaultInit: JaFetchRequestInit;
    interceptors: Interceptors;
    constructor(defaultInit?: JaFetchRequestInit);
    create(init?: JaFetchRequestInit): Service;
    private requestAdapter;
    request(url: string, init?: JaFetchRequestInit): Promise<any>;
    get(url: string, init?: JaFetchRequestInit): Promise<any>;
    post(url: string, init?: JaFetchRequestInit): Promise<any>;
    put(url: string, init?: JaFetchRequestInit): Promise<any>;
    del(url: string, init?: JaFetchRequestInit): Promise<any>;
}
