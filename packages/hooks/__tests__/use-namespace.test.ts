import { afterEach, describe, expect, it } from 'vitest'
import { cleanup, render } from 'vitest-browser-vue'
import { defineComponent, h, provide, ref } from 'vue'

import { namespaceContextKey, useNamespace } from '..'

afterEach(cleanup)

const TestComp = defineComponent({
  setup() {
    const ns = useNamespace('table')
    return () =>
      h('div', {
        'data-testid': 'test',
        class: [
          ns.b(),
          ns.b('body'),
          ns.e('content'),
          ns.m('active'),
          ns.be('body', 'active'),
          ns.em('content', 'active'),
          ns.bm('body', 'active'),
          ns.bem('body', 'content', 'active'),
          ns.is('focus'),
          // 下面这些参数不全，一律空串，不产生 class
          ns.e(),
          ns.m(),
          ns.be(),
          ns.em(),
          ns.bm(),
          ns.bem(),
          ns.is('hover', undefined),
          ns.is('clicked', false),
        ],
      })
  },
})

const OverrideComp = defineComponent({
  setup() {
    const ns = useNamespace('table', ref('override'))
    return () => h('div', { 'data-testid': 'test', class: ns.b() })
  },
})

describe('useNamespace inside a component', () => {
  it('builds the bem classes on the rendered element', async () => {
    const { getByTestId } = await render(TestComp)

    const el = await getByTestId('test').element()

    expect([...el.classList]).toEqual([
      'tm-table',
      'tm-table-body',
      'tm-table__content',
      'tm-table--active',
      'tm-table-body__active',
      'tm-table__content--active',
      'tm-table-body--active',
      'tm-table-body__content--active',
      'is-focus',
    ])
  })

  it('reads the namespace from the provided context', async () => {
    const Provider = defineComponent({
      setup() {
        provide(namespaceContextKey, ref('provided'))
        return () => h(TestComp)
      },
    })

    const { getByTestId } = await render(Provider)

    await expect.element(getByTestId('test')).toHaveClass('provided-table')
  })

  it('lets the namespace override win over the provided context', async () => {
    const Provider = defineComponent({
      setup() {
        provide(namespaceContextKey, ref('provided'))
        return () => h(OverrideComp)
      },
    })

    const { getByTestId } = await render(Provider)

    await expect.element(getByTestId('test')).toHaveClass('override-table')
  })
})

// 空串在 class 数组里看不出来，只能直接断言返回值
describe('useNamespace with incomplete arguments', () => {
  const ns = useNamespace('table')

  it('returns an empty string', () => {
    expect(ns.e()).toBe('')
    expect(ns.m()).toBe('')
    expect(ns.be()).toBe('')
    expect(ns.em()).toBe('')
    expect(ns.bm()).toBe('')
    expect(ns.bem()).toBe('')
  })

  it('returns an empty string for a falsy state', () => {
    expect(ns.is('hover', undefined)).toBe('')
    expect(ns.is('clicked', false)).toBe('')
    expect(ns.is('active')).toBe('is-active')
  })
})
