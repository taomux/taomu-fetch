import { RequestHooks } from './defines'

export const requestHooks: RequestHooks = {
  openToast: () => console.warn('请使用 setRequestHooks 方法初始化 openToast 函数'),
  openModal: () => console.warn('请使用 setRequestHooks 方法初始化 openModal 函数'),
  onLoginInvalid: () => console.warn('登录态已失效, 请使用 setRequestHooks 方法初始化 onLoginInvalid 函数'),
}

const defaultRequestOptions: RequestOptions = {
  baseURL: process.env.API_BASE,
  timeout: 60000, // 一分钟超时
  errorType: 'toast',
  checkStatus: true,
  handleErrors: true,
  formData: false,
  deleteUndefinedParams: true,
  trimParams: true,

  method: 'GET',
  mode: 'cors',
  withCredentials: true,
  cache: 'no-cache',
}

/** 获取全局默认 RequestOptions */
export function getRequestDefaultOptions() {
  return Object.assign({}, defaultRequestOptions)
}

/** 设置全局默认 RequestOptions */
export function setRequestDefaultOptions(options: RequestOptions) {
  Object.assign(defaultRequestOptions, options)
}

/** 设置全局 Hooks */
export function setRequestHooks(options: Partial<RequestHooks>) {
  Object.assign(requestHooks, options)
}
