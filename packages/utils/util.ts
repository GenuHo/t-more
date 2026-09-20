import { isUndefined } from 'lodash-unified'

// 连续的一系列参数，取到第一个不是undefined的数据进行返回
export function getFirstDefined(...args: any[]) {
  for (let i = 0; i < args.length; i++) {
    if (!isUndefined(args[i])) {
      return args[i]
    }
  }
}
