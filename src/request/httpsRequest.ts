/* eslint-disable no-unused-vars */
import urlArgs from './interceptors'
import { apiUrl } from '../config'
import { HttpStatus } from './enum'
import Taro from '@tarojs/taro'

// 创建请求队列管理
class RequestQueue {
  private static instance: RequestQueue
  private queue: Array<() => Promise<void>> = [] // ✅ 存函数，而不是 config
  private isProcessing = false

  private constructor() {}

  static getInstance(): RequestQueue {
    if (!RequestQueue.instance) {
      RequestQueue.instance = new RequestQueue()
    }
    return RequestQueue.instance
  }

  add(task: () => Promise<void>) {
    // ✅ 接收函数
    this.queue.push(task)
  }

  clear() {
    this.queue = []
  }

  async process() {
    if (this.isProcessing || this.queue.length === 0) {
      return
    }

    this.isProcessing = true
    const task = this.queue.shift()

    try {
      if (task) {
        await task() // ✅ 执行函数（会重新触发 setData）
      }
    } catch (error) {
      console.error('重试请求失败:', error)
    } finally {
      this.isProcessing = false
      if (this.queue.length > 0) {
        setTimeout(() => this.process(), 0)
      }
    }
  }
}

const requestQueue = RequestQueue.getInstance()

const interceptors = [
  urlArgs.request.onFulfilled,
  Taro.interceptors.timeoutInterceptor,
]
interceptors.forEach((interceptorItem) => Taro.addInterceptor(interceptorItem))

// 定义一个返回对象中code不为0时的错误
export class CodeNotZeroError extends Error {
  code: number

  constructor(code: number, message: string) {
    super(message)
    this.code = code
  }
}

export interface BackendResultFormat<T = unknown> {
  result: number
  data: T | null
  resultMessage: string
  errMsg: string | null
}
export interface ResultFormat<T = unknown> {
  data: BackendResultFormat<T> | T | unknown
  err: { code: number; message: string } | null
  response: Taro.request.SuccessCallbackResult | null
}

export interface RequestConfig extends Taro.request.Option<unknown, string> {
  // url为必填项
  url: NonNullable<Taro.request.Option<unknown, string>['url']>
  args?: Record<string, unknown>
  // 添加重试标识，避免重复加入队列
  retry?: boolean
}

/**
 * 允许定义四个可选的泛型参数：
 *    Payload: 用于定义响应结果的数据类型
 *    Data：用于定义data的数据类型
 *    Params：用于定义parmas的数据类型
 *    Args：用于定义存放路径参数的属性args的数据类型
 */
interface MakeRequest {
  <Payload = unknown>(
    config: RequestConfig
  ): (requestConfig?: Partial<RequestConfig>) => Promise<ResultFormat<Payload>>

  <Payload, Data>(
    config: RequestConfig
  ): (
    requestConfig: Partial<Omit<RequestConfig, 'data'>> & { data: Data }
  ) => Promise<ResultFormat<Payload>>

  <Payload, Data, Params>(
    config: RequestConfig
  ): (
    requestConfig: Partial<Omit<RequestConfig, 'data' | 'params'>> &
      (Data extends undefined ? { data?: undefined } : { data: Data }) & {
        params: Params
      }
  ) => Promise<ResultFormat<Payload>>

  <Payload, Data, Params, Args>(
    config: RequestConfig
  ): (
    requestConfig: Partial<Omit<RequestConfig, 'data' | 'params' | 'args'>> &
      (Data extends undefined ? { data?: undefined } : { data: Data }) &
      (Params extends undefined
        ? { params?: undefined }
        : { params: Params }) & {
        args: Args
      }
  ) => Promise<ResultFormat<Payload>>
}

// makeRequest用于生成支持智能推导，路径替换，捕获错误的请求函数
// 其形参的类型为RequestConfig，该类型在继承AxiosConfig上加了些自定义属性,例如存放路径参数的属性args
// makeRequest带有四个可选泛型，分别为：
//  - Payload: 用于定义响应结果的数据类型，若没有则可定义为undefined，下面的变量也一样
//  - Data：用于定义data的数据类型
//  - Params：用于定义parmas的数据类型
//  - Args：用于定义存放路径参数的属性args的数据类型
const makeRequest: MakeRequest = <T>(config: RequestConfig) => {
  return async (requestConfig?: Partial<RequestConfig>) => {
    // 合并在service中定义的option和调用时从外部传入的option
    const xTenantCode =
      Taro.getStorageSync(`x-tenant-code`) || '788a35e64092b5fb'
    const mergedConfig: RequestConfig = {
      ...config,
      ...requestConfig,
      url: apiUrl + config?.url,
      header: {
        ...config.header,
        ...requestConfig?.header,
        'x-tenant-code': xTenantCode,
        'x-system-code': 'cus_font',
        'x-token': Taro.getStorageSync('x-token'),
      },
    }
    // 统一处理返回类型
    try {
      const response: Taro.request.SuccessCallbackResult<
        BackendResultFormat<T>
      > = await Taro.request<BackendResultFormat<T>>(mergedConfig)

      const res = response.data
      const { result, resultMessage, ...remainData } = res

      if (result === HttpStatus.authenticate) {
        Taro.removeStorageSync(`x-token`)

        // ✅ 把一个可执行的函数存进队列，而不是 config
        if (!mergedConfig.retry) {
          requestQueue.add(async () => {
            await makeRequest<T>({ ...config, retry: true })(requestConfig)
          })
        }

        Taro.navigateTo({
          url: '/pages/login/index',
        })

        return {
          err: { code: result, message: resultMessage },
          data: remainData,
          response,
        }
      } else if (res.result !== HttpStatus.success) {
        return {
          err: { code: result, message: resultMessage },
          data: remainData,
          response,
        }
      }

      return {
        err: null,
        data: remainData,
        response,
      }
    } catch (err) {
      return { err, data: null, response: null }
    }
  }
}

// 登录成功后调用此函数处理重试队列
export const processPendingRequests = () => {
  requestQueue.process()
}

export default makeRequest
