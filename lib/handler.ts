import { requestHooks } from './config'
import { RequestStatus } from './defines'

/**
 * 各种错误处理
 * @param err
 * @param sendData
 * @param options
 */
export function errorHandler<T extends RequestRes>(errorData: T, sendData: RequestSendData, options: RequestOptions) {
  const { msg, message, code, status } = errorData
  const { codeMap, loginInvalidCode = RequestStatus.未登录 } = options

  errorData.message = message || msg || '系统繁忙, 请稍后再试'

  if (status == RequestStatus.服务不可用) {
    errorData.message = '系统维护中, 请稍后再试'
  }

  if (typeof window !== 'undefined' && !window.navigator.onLine) {
    errorData.message = '网络异常, 请检查您的网络是否可用'
  }

  switch (code) {
    // 未登录/登录超时
    case loginInvalidCode: {
      errorData.message = '登录已失效，请重新登录！'
      requestHooks.onLoginInvalid(errorData, sendData, options)
      break
    }

    default: {
      if (codeMap && codeMap[code!]) {
        errorData.message = codeMap[code!]
      }

      showErrorMessage(errorData, sendData, options)
      break
    }
  }

  if (requestHooks.onError) {
    return requestHooks.onError(errorData, sendData, options)
  }

  if (requestHooks.logger) {
    requestHooks.logger.error(errorData.message, errorData)
  } else {
    console.error(errorData.message, errorData)
  }

  return Promise.reject(Object.assign(errorData, { sendData }))
}

/** 显示错误消息 */
export function showErrorMessage(errorData: RequestRes, sendData: RequestSendData, options: RequestOptions) {
  if (options.errorType === false) return

  switch (options.errorType) {
    case 'modal':
      requestHooks.openModal(errorData, sendData, options)
      break

    default:
      requestHooks.openToast(errorData, sendData, options)
      break
  }
}
