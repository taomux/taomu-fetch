import { RequestHooks, RequestStatus } from './defines'

export const requestHooks: RequestHooks = {
  openToast: () => console.warn('请使用 setRequestHooks 方法初始化 openToast 函数'),
  openModal: () => console.warn('请使用 setRequestHooks 方法初始化 openModal 函数'),
  onLoginInvalid: () => console.warn('登录态已失效, 请使用 setRequestHooks 方法初始化 onLoginInvalid 函数'),
  handleParams: (params) => params,
  handleResponse: async (res) => {
    let data: any = {}

    try {
      data = await res.json()
    } catch (err) {
      data.raw = await res.text().catch(() => '')
      data.code = RequestStatus.数据格式异常
      data.message = '返回数据不是JSON格式'
    }

    if (!res.ok && !data.code) {
      // data.code = res.status
      data.code = RequestStatus.状态码异常
      data.message = `${data.message} 错误代码:${res.status}`
    }

    return data
  },
}

const defaultRequestOptions: RequestOptions = {
  baseURL: process.env.API_BASE,
  timeout: 60000, // 一分钟超时
  errorType: 'toast',
  checkStatus: true,
  handleErrors: true,
  formData: false,

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
