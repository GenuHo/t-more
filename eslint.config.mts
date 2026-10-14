import globals from 'globals'
import pluginJs from '@eslint/js'
import tseslint from 'typescript-eslint'
import pluginVue from 'eslint-plugin-vue'
import pluginVitest from '@vitest/eslint-plugin'
import eslintConfigPrettier from 'eslint-config-prettier/flat'
import adminAppEslintrcAutoImportJson from './admin-app/.eslintrc-auto-import.json'

/** @type {import('eslint').Linter.Config[]} */
export default [
  { files: ['**/*.{js,mjs,cjs,ts,tsx,vue}'] },
  {
    ignores: [
      // 不带 / 的模式只匹配根层，子包的产物必须写成 **/
      '**/node_modules/**',
      '**/dist/**',
      '**/coverage/**',
      '**/components.d.ts',
      '**/auto-imports.d.ts',
      '**/*.tsbuildinfo',
      '**/.vitepress/cache/**',
      'pnpm-lock.yaml',
      '!.*',
    ],
  },
  { languageOptions: { globals: globals.browser } },
  // admin-app项目，增加增加auto-imports的相关globals
  {
    files: ['admin-app/**/*.{js,mjs,cjs,ts,tsx,vue}'],
    languageOptions: {
      globals: {
        ...globals.browser,
        ...adminAppEslintrcAutoImportJson.globals,
      },
    },
  },
  pluginJs.configs.recommended,
  ...tseslint.configs.recommended,
  ...pluginVue.configs['flat/essential'],
  {
    files: ['**/*.vue'],
    languageOptions: {
      parserOptions: { parser: tseslint.parser, ecmaFeatures: { jsx: true } },
    },
    rules: {},
  },
  { files: ['**/__tests__/*'], ...pluginVitest.configs.recommended },
  {
    files: ['**/*.tsx', '**/*.vue'],
    rules: {
      // TODO，@tdesign-vue-next/auto-import-resolver生成的.eslintrc-auto-import.json中不含有对应的变量
      'no-undef': 'off', // https://github.com/unplugin/unplugin-auto-import#eslint
    },
  },
  {
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      // 添加这一行来强制类型导入使用 import type
      '@typescript-eslint/consistent-type-imports': [
        'error',
        {
          prefer: 'type-imports',
          disallowTypeAnnotations: false,
        },
      ],
      'vue/multi-word-component-names': 'off',
    },
  },
  eslintConfigPrettier,
]
