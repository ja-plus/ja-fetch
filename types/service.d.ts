import Interceptors from './interceptors';
export interface JaFetchRequestInit extends RequestInit {
    params?: any;
    responseType?: 'text' | 'blob' | 'arraybuffer' | 'response';
}
export default class Service {
    defaultConf: JaFetchRequestInit;
    interceptors: Interceptors;
    constructor(defaultConf?: JaFetchRequestInit);
    create(config: JaFetchRequestInit): Service;
    private requestAdapter;
    request(url: string, config?: JaFetchRequestInit): Promise<any>;
    get(url: string, config?: JaFetchRequestInit): Promise<any>;
    post(url: string, config?: JaFetchRequestInit): Promise<any>;
    put(url: string, config?: JaFetchRequestInit): Promise<any>;
    del(url: string, config?: JaFetchRequestInit): Promise<any>;
}
