import { isString } from 'lodash-unified'

class TMoreError extends Error {
  constructor(m: string) {
    super(m)
    this.name = 'TMoreError'
  }
}

/**
 * 抛出组件库错误。
 * 与 debugWarn 不同，此函数在生产环境同样会抛出，用于使用方必然无法继续运行的场景。
 * @param scope - 错误来源，通常为组件名，最终以 `[scope]` 形式作为消息前缀
 * @param m - 错误信息
 */
export function throwError(scope: string, m: string): never {
  throw new TMoreError(`[${scope}] ${m}`)
}

/**
 * 仅在非生产环境打印警告，用于使用方配置有误等可降级处理的场景。
 * 支持两种调用方式：`debugWarn(scope, message)` 或 `debugWarn(error)`。
 * @param scope - 警告来源（通常为组件名），或直接传入一个 Error 实例
 * @param message - 警告信息，当 scope 为 Error 时可省略
 */
export function debugWarn(err: Error): void
export function debugWarn(scope: string, message: string): void
export function debugWarn(scope: string | Error, message?: string): void {
  if (process.env.NODE_ENV !== 'production') {
    const error: Error = isString(scope)
      ? new TMoreError(`[${scope}] ${message}`)
      : scope
    console.warn(error)
  }
}
