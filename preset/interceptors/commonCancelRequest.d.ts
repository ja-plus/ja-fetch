type DefaultOption = {
  notInterceptKey: string,
  gcCacheArrNum: number
}
type MyRequestInit = {
  params?:any,
  responseType?: 'text' | 'blob' | 'arraybuffer' | 'response';
}
type RequestConfig = {
  url: string,
  config: MyRequestInit
}
type AbortFilter = (store, now) => boolean
export default function commCancelRequest(abortFilter: AbortFilter, option: DefaultOption): { install }