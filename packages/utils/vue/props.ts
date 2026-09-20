import { camelize } from 'vue'
import type { OptionalKeys } from '../type-helpers'

// 删除组件自身声明的属性，避免透传给下层组件
export const deleteOwnProps = <T extends object, U extends OptionalKeys<T>>(
  props: T,
  ownKeys: U[],
) => {
  const normalizedKeys = ownKeys.map((key) => camelize(String(key)))
  Object.keys(props).forEach((key) => {
    if (normalizedKeys.includes(camelize(key))) {
      delete props[key as U]
    }
  })
}
