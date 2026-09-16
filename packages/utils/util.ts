import { isUndefined } from 'lodash-unified'
import { camelize } from 'vue'
import type { OptionalKeys } from './type-helpers'

// 连续的一系列参数，取到第一个不是undefined的数据进行返回
export function getFirstDefined(...args: any[]) {
  for (let i = 0; i < args.length; i++) {
    if (!isUndefined(args[i])) {
      return args[i]
    }
  }
}

// 删除对象中的某些属性
export const deleteObjectKeys = <T extends object, U extends OptionalKeys<T>>(
  obj: T,
  keys: U[],
) => {
  const normalizedKeys = keys.map((key) => camelize(String(key)))
  Object.keys(obj).forEach((key) => {
    if (normalizedKeys.includes(camelize(key))) {
      delete obj[key as U]
    }
  })
}
