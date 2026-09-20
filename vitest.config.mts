import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import { TDesignResolver } from '@tdesign-vue-next/auto-import-resolver'
import { playwright } from '@vitest/browser-playwright'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { configDefaults, defineConfig, defineProject } from 'vitest/config'

const tdesignResolver = TDesignResolver({
  library: 'vue-next',
  resolveIcons: true,
})

// 纯函数用例：不挂载组件、不需要 DOM，放 node 项目跑更快，后续逐步补充
const nodeTests: string[] = ['packages/utils/__tests__/**/*.test.ts']

export default defineConfig({
  plugins: [
    vue(),
    vueJsx(),
    AutoImport({
      dts: false,
      include: [
        /\.[tj]sx?$/, // .ts, .tsx, .js, .jsx
        /\.vue$/,
        /\.vue\?vue/, // .vue
        /\.vue\.[tj]sx?\?vue/, // .vue (vue-loader with experimentalInlineMatchResource enabled)
        // /\.md$/, // .md
      ],
      resolvers: [tdesignResolver],
    }),
    Components({
      dts: false,
      include: [/\.vue$/, /\.vue\?vue/, /\.tsx$/, /\.jsx$/],
      resolvers: [tdesignResolver],
    }),
  ],
  test: {
    clearMocks: true,
    projects: [
      defineProject({
        test: {
          name: 'node',
          environment: 'node',
          include: nodeTests,
        },
      }),
      defineProject({
        test: {
          name: 'browser',
          // 兜住全部用例，再由 exclude 把上面挑出的纯逻辑用例让给 node 项目，两者正好互补
          include: ['packages/**/__tests__/**/*.test.{ts,tsx}'],
          exclude: [...configDefaults.exclude, ...nodeTests],
          browser: {
            enabled: true,
            headless: true,
            // 指定 channel 才走完整 chromium，否则无头模式会去找没装的 chromium-headless-shell
            provider: playwright({ launchOptions: { channel: 'chromium' } }),
            instances: [{ browser: 'chromium' }],
          },
        },
      }),
    ],
  },
})
