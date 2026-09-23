import { afterEach, describe, expect, it } from 'vitest'
import { cleanup, render } from 'vitest-browser-vue'
import { defineComponent, h, ref } from 'vue'

import type { Language } from '@tailor-more/t-more-locale'
import {
  buildLocaleContext,
  buildTranslator,
  provideLocale,
  translate,
  useLocale,
} from '..'

afterEach(cleanup)

const zhCn: Language = {
  name: 'zh-cn',
  tm: {
    table: { operation: '操作' },
    hello: '你好 {name}',
  },
}

const en: Language = { name: 'en', tm: {} }

const customLocale: Language = {
  name: 'custom',
  tm: { table: { operation: 'CUSTOM' } },
}

const TestComp = defineComponent({
  setup() {
    const { lang, t } = useLocale()
    return () =>
      h('div', [
        h('span', { 'data-testid': 'lang' }, lang.value),
        h('span', { 'data-testid': 'text' }, t('tm.table.operation')),
      ])
  },
})

describe('useLocale inside a component', () => {
  it('falls back to the shipped zh-cn locale', async () => {
    const { getByTestId } = await render(TestComp)

    await expect.element(getByTestId('lang')).toHaveTextContent('zh-cn')
    // 不锁死文案，只确认这个 key 真能查到
    await expect
      .element(getByTestId('text'))
      .not.toHaveTextContent('tm.table.operation')
  })
})

describe('provideLocale', () => {
  it('lets a descendant read the provided locale', async () => {
    const Provider = defineComponent({
      setup() {
        provideLocale(ref(customLocale))
        return () => h(TestComp)
      },
    })

    const { getByTestId } = await render(Provider)

    await expect.element(getByTestId('lang')).toHaveTextContent('custom')
    await expect.element(getByTestId('text')).toHaveTextContent('CUSTOM')
  })
})

describe('translate', () => {
  it('resolves a nested path', () => {
    expect(translate('tm.table.operation', undefined, zhCn)).toBe('操作')
  })

  it('falls back to the path itself when nothing matches', () => {
    expect(translate('tm.table.missing', undefined, zhCn)).toBe(
      'tm.table.missing',
    )
  })

  it('interpolates the options', () => {
    expect(translate('tm.hello', { name: 'world' }, zhCn)).toBe('你好 world')
  })

  it('keeps the placeholder when the option is absent', () => {
    expect(translate('tm.hello', undefined, zhCn)).toBe('你好 {name}')
    expect(translate('tm.hello', {}, zhCn)).toBe('你好 {name}')
  })
})

describe('buildTranslator', () => {
  it('reads the locale from a ref', () => {
    expect(buildTranslator(ref(zhCn))('tm.table.operation')).toBe('操作')
  })

  it('reads the locale from a plain object', () => {
    expect(buildTranslator(zhCn)('tm.table.operation')).toBe('操作')
  })
})

describe('buildLocaleContext', () => {
  it('derives lang from the locale name', () => {
    expect(buildLocaleContext(ref(zhCn)).lang.value).toBe('zh-cn')
  })

  it('holds the given locale', () => {
    expect(buildLocaleContext(ref(zhCn)).locale.value).toEqual(zhCn)
  })

  it('follows later locale changes', () => {
    const locale = ref<Language>(zhCn)
    const context = buildLocaleContext(locale)

    locale.value = en

    expect(context.lang.value).toBe('en')
    expect(context.t('tm.table.operation')).toBe('tm.table.operation')
  })
})
