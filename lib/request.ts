import { trimValues, queryStringify } from 'taomu-toolkit'

import { RequestStatus } from './defines'
import { getRequestDefaultOptions, requestHooks } from './config'
import { errorHandler } from './handler'

const REG_IS_URL = /^(https?:)?\/\/.+$/

/**
 * 发起一个网络请求，使用 [JavaScript Fetch API](https://developer.mozilla.org/zh-CN/docs/Web/API/Fetch_API)
 *
 * @param path 请求路径，如果不是绝对路径，自动补全 baseURL
 * @param params 请求参数
 * @param optionsSource 请求选项
 * @returns
 */
export async function request<T extends RequestRes, P>(
  path: string,
  paramsSource?: P,
  optionsSource?: RequestOptions
): Promise<T> {
  const controller = new AbortController() // Promise 阻断控制器
  const options: RequestOptions = Object.assign(getRequestDefaultOptions(), optionsSource)
  const {
    baseURL,
    method,
    checkStatus,
    formData,
    handleErrors,
    headers: userHeaders = {},
    addTimeStamp,
    timeout,
    withCredentials,
    defaultParams = {},
    trimParams,
    useQueryParams,
    deleteUndefinedParams,
    successCode = RequestStatus.成功,
    ...fetchOptions
  } = options

  const url = REG_IS_URL.test(path) ? path : `${baseURL}${path}`

  // 参数处理，移除字符串两端空格 & 删除 undefined 字段
  const params = trimValues(paramsSource, trimParams, deleteUndefinedParams)

  // 请求头
  let headersObj: Record<string, any> = {}

  if (typeof userHeaders === 'function') {
    headersObj = userHeaders(url, params, options)
  } else if (typeof userHeaders === 'object') {
    headersObj = userHeaders
  }

  const headers = new Headers(headersObj)

  if (addTimeStamp) {
    defaultParams.t = Date.now()
  }

  const sendData: RequestSendData = {
    path,
    url,
    method,
    headers,
    signal: controller.signal,
    ...fetchOptions,
  }

  let paramsData: any = params

  if (paramsData instanceof FormData) {
    // FormData
  } else if (Array.isArray(paramsData)) {
    // 数组
  } else if (typeof paramsData === 'object') {
    paramsData = Object.assign({}, defaultParams, params)
  }

  if (useQueryParams || ['GET', 'HEAD'].includes(method!.toUpperCase())) {
    const paramsStr = queryStringify(paramsData, true)
    sendData.url = sendData.url + paramsStr
  } else if (formData) {
    headers.delete('Content-Type')
    if (paramsData instanceof FormData) {
      sendData.body = paramsData
    } else {
      sendData.body = objectToFormData(paramsData)
    }
  } else {
    sendData.body = JSON.stringify(paramsData)
  }

  // 超时控制
  let timer: NodeJS.Timeout | null = null
  if (timeout) {
    timer = setTimeout(() => {
      controller.abort()
    }, timeout)
  }

  let beforeRes: any = undefined
  if (requestHooks.beforeRequest) {
    beforeRes = await requestHooks.beforeRequest(sendData, options)
  }

  let resData: T = {} as T

  await fetch(sendData.url, sendData)
    .then(async (res) => {
      let data: T = {} as T

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

      resData = data

      if (requestHooks.checkStatus) {
        return requestHooks.checkStatus(data, sendData, options)
      } else if (!checkStatus || data.code == successCode) {
        return data
      }

      return Promise.reject(data)
    })
    .catch((err) => {
      let errH = err

      if (typeof err !== 'object') {
        errH = {
          message: err,
        }
      }

      resData = errH

      if (handleErrors) {
        return errorHandler<T>(errH, sendData, options)
      } else {
        return Promise.resolve(errH)
      }
    })
    .finally(() => {
      if (requestHooks.afterRequest) {
        return requestHooks.afterRequest(beforeRes, resData, sendData, options)
      }
    })

  if (timer) {
    clearTimeout(timer)
  }

  return resData
}

/** 将 Object 转换为 FormData，支持数组和嵌套对象 */
function objectToFormData(obj: Record<string, any>): FormData {
  const formData = new FormData()

  function appendToFormData(data: any, parentKey: string = '') {
    if (data !== null && typeof data === 'object') {
      // Handle File objects directly
      if (data instanceof File || data instanceof Blob) {
        formData.append(parentKey, data)
        return
      }

      // Handle arrays and objects
      if (Array.isArray(data)) {
        data.forEach((item, index) => {
          const key = parentKey ? `${parentKey}[${index}]` : index.toString()
          appendToFormData(item, key)
        })
      } else {
        for (const key in data) {
          if (data.hasOwnProperty(key)) {
            const fullKey = parentKey ? `${parentKey}[${key}]` : key
            appendToFormData(data[key], fullKey)
          }
        }
      }
    } else if (data !== undefined) {
      // Handle primitive values
      formData.append(parentKey, data)
    }
  }

  appendToFormData(obj)
  return formData
}
