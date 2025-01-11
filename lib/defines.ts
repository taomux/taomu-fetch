import type { Logger } from 'taomu-logger'

export enum RequestStatus {
  成功 = 200,
  未登录 = 401,
  服务器错误 = 500,
  服务不可用 = 503,
  未知异常 = 4000,
  数据格式异常,
  状态码异常,
}

declare global {
  export type FetchMethods =
    | 'get'
    | 'GET'
    | 'delete'
    | 'DELETE'
    | 'head'
    | 'HEAD'
    | 'options'
    | 'OPTIONS'
    | 'post'
    | 'POST'
    | 'put'
    | 'PUT'
    | 'patch'
    | 'PATCH'
    | 'purge'
    | 'PURGE'
    | 'link'
    | 'LINK'
    | 'unlink'
    | 'UNLINK'

  export interface RequestSendData extends Omit<RequestInit, 'headers'> {
    url: string
    path: string
    headers: Headers
  }

  /** 网络请求返回值 */
  export interface RequestRes {
    /** 原始数据, 当返回结果无法用 json 解析时，返回原始数据 */
    raw?: string
    /** 状态 */
    status?: number | string | boolean
    /** 结果码:200成功 其他情况参考码表 */
    code?: number | string
    /** 返回对象 */
    data?: any
    /** 返回消息 */
    msg?: string
    /** 返回消息 */
    message?: string
  }

  /** 请求选项 */
  export interface RequestOptions extends Omit<RequestInit, 'headers'> {
    /** 请求基础路径 */
    baseURL?: string
    /** 请求方法 */
    method?: FetchMethods
    /** 请求超时 */
    timeout?: number

    /** 请求头 */
    headers?: Record<string, string> | ((url: string, params: any, options: RequestOptions) => Record<string, string>)
    /** 是否携带 cookie */
    withCredentials?: boolean
    /** 是否使用查询参数, 默认: false, 启用后会强制使用 url-search 传参 */
    useQueryParams?: boolean
    /** 使用 formData 传递参数 */
    formData?: boolean
    /** 返回错误时是否执行错误处理 默认: true */
    handleErrors?: boolean
    /** 发生错误时提示框类型: 默认: toast */
    errorType?: 'toast' | 'modal' | false
    /** 是否校验请求状态 */
    checkStatus?: boolean
    /** 是否添加时间戳 */
    addTimeStamp?: boolean
    /** errorCode 映射表 */
    codeMap?: Record<string, string>
    /** 默认请求参数 */
    defaultParams?: Record<string, any>
    /** 是否删除空值参数, 默认: true */
    deleteUndefinedParams?: boolean
    /** 是否自动去除参数的两端空格，默认: true */
    trimParams?: boolean
    /** 成功状态码 */
    successCode?: number
    /** 登录失效状态码 */
    loginInvalidCode?: number
  }
}

/** 一些钩子 */
export interface RequestHooks {
  /** 与 logger 集成 */
  logger?: Logger
  /** openToast */
  openToast: <T extends RequestRes>(err: T, sendData: RequestSendData, options: RequestOptions) => void
  /** openModal */
  openModal: <T extends RequestRes>(err: T, sendData: RequestSendData, options: RequestOptions) => void
  /** 异常时调用 */
  onError?: <T extends RequestRes>(err: T, sendData: RequestSendData, options: RequestOptions) => void
  /** 登录失效时调用 */
  onLoginInvalid: <T extends RequestRes>(err: T, sendData: RequestSendData, options: RequestOptions) => void
  /** 检查请求状态 */
  checkStatus?: <T extends RequestRes>(result: T, sendData: RequestSendData, options: RequestOptions) => Promise<T>
  /**
   * 请求前调用，配合 afterRequest 可实现自动化 loading
   *
   * - 本函数返回值会被 afterRequest 第一个参数接收
   */
  beforeRequest?: (sendData: RequestSendData, options: RequestOptions) => Promise<any> | any
  /**
   * 请求后调用, 对应 .finally 方法
   */
  afterRequest?: <T extends RequestRes, R = any>(before: R, data: T, sendData: RequestSendData, options: RequestOptions) => any
}
