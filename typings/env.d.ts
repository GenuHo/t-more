//TODO 先解决引入tsx的less报错问题，打包不一定使用vite
/// <reference types="vite/client" />
// 使用docs都有用到的类型，因为docs里面都会有packages中的组件的文档
/// <reference types="../docs/components" />

import type { INSTALLED_KEY } from '@tailor-more/t-more-constants'

declare module 'vue' {
  export interface App {
    [INSTALLED_KEY]?: boolean
  }
}

export {}
