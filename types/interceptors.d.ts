import { JaFetchRequestInit } from './service';
declare type ReqOnFulfilled = (url: string, init: JaFetchRequestInit) => JaFetchRequestInit;
declare type ResOnFulfilled = (data: any, requestInfo: {
    url: string;
    config: JaFetchRequestInit;
}, response: Response) => void;
declare type OnRejected = (error: any) => Promise<any>;
declare type Store<T, U> = {
    id: number;
    onFulfilled: T;
    onRejected: U;
}[];
declare class Interceptor<T, U> {
    store: Store<T, U>;
    onFulfilled: T;
    onRejected: U;
    use(onFulfilled: T, onRejected: U): number;
    remove(id: number): void;
}
export default class Interceptors {
    request: Interceptor<ReqOnFulfilled, OnRejected>;
    response: Interceptor<ResOnFulfilled, OnRejected>;
    use(obj: {
        install: (interceptors: Interceptors) => void;
    }): void;
    create(): Interceptors;
}
export {};
