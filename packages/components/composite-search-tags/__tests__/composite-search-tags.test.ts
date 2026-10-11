import type {
  TmCompositeSearchFieldItem,
  TmCompositeSearchPayload,
} from '@tailor-more/t-more-components'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { page } from 'vitest/browser'
import { cleanup, render } from 'vitest-browser-vue'

import TmCompositeSearchTags from '..'

const allFields: TmCompositeSearchFieldItem[] = [
  { type: 'input', name: '关键字', field: 'keyword' },
  {
    type: 'single',
    name: '状态',
    field: 'status',
    list: [
      { label: '启用', value: 1 },
      { label: '停用', value: 0 },
    ],
  },
  {
    type: 'multiple',
    name: '标签',
    field: 'tags',
    list: [
      { label: '甲', value: 'a' },
      { label: '乙', value: 'b' },
    ],
  },
]

const allPayloads: TmCompositeSearchPayload[] = [
  { field: 'keyword', name: '关键字', value: 'k1' },
  { field: 'status', name: '状态', value: 0 },
  { field: 'tags', name: '标签', value: ['a', 'b'] },
]

const tagTexts = (container: HTMLElement) =>
  [...container.querySelectorAll('.t-tag')].map((tag) =>
    tag.textContent?.trim(),
  )

const payloadTags = (container: HTMLElement) => [
  ...container.querySelectorAll('.tm-composite-search-tags__tag'),
]

const renderTags = async (
  options: {
    searchFields?: TmCompositeSearchFieldItem[]
    value?: TmCompositeSearchPayload[]
  } = {},
) => {
  const onClose = vi.fn()
  const onClear = vi.fn()
  const result = await render(TmCompositeSearchTags, {
    props: {
      searchFields: options.searchFields ?? allFields,
      value: options.value ?? allPayloads,
      onClose,
      onClear,
    },
  })
  return { result, onClose, onClear }
}

describe('TmCompositeSearchTags', () => {
  afterEach(cleanup)

  it('renders nothing when value is empty', async () => {
    const { result } = await renderTags({ value: [] })

    expect(
      result.container.querySelector('.tm-composite-search-tags'),
    ).toBeNull()
  })

  it('renders a tag for each payload with the clear tag last', async () => {
    const { result } = await renderTags()

    expect(tagTexts(result.container)).toEqual([
      '关键字：k1',
      '状态：停用',
      '标签：甲|乙',
      '清除',
    ])
  })

  it('falls back to the payload name and resolves a lazy field name', async () => {
    const { result } = await renderTags({
      searchFields: [
        { type: 'input', name: '关键字', field: 'keyword' },
        { type: 'input', name: () => '惰性名', field: 'lazy' },
      ],
      value: [
        { field: 'unknown', name: '外部', value: 'x' },
        { field: 'lazy', name: '惰性名', value: 'y' },
      ],
    })

    expect(tagTexts(result.container)).toEqual(['外部：x', '惰性名：y', '清除'])
  })

  it('renders an empty text when the value is not in the list', async () => {
    const { result } = await renderTags({
      value: [
        { field: 'status', name: '状态', value: 9 },
        { field: 'tags', name: '标签', value: ['a', 'zz'] },
      ],
    })

    expect(tagTexts(result.container)).toEqual(['状态：', '标签：甲|', '清除'])
  })

  it('closes the tag it belongs to', async () => {
    const { result, onClose, onClear } = await renderTags()

    await page
      .elementLocator(payloadTags(result.container)[1]!.querySelector('svg')!)
      .click()

    expect(onClose).toHaveBeenCalledExactlyOnceWith({
      field: 'status',
      name: '状态',
      value: 0,
    })
    expect(onClear).not.toHaveBeenCalled()
  })

  it('clears every tag', async () => {
    const { result, onClose, onClear } = await renderTags()

    await result.getByText('清除').click()

    expect(onClear).toHaveBeenCalledOnce()
    expect(onClose).not.toHaveBeenCalled()
  })

  it('follows the searchFields updates', async () => {
    const { result } = await renderTags({
      value: [{ field: 'status', name: '状态', value: 0 }],
    })
    expect(tagTexts(result.container)).toEqual(['状态：停用', '清除'])

    // 只换 searchFields，value 保持不变
    await result.rerender({
      searchFields: [
        {
          type: 'single',
          name: '状态',
          field: 'status',
          list: [{ label: '已停用', value: 0 }],
        },
      ],
    })

    expect(tagTexts(result.container)).toEqual(['状态：已停用', '清除'])
  })
})
