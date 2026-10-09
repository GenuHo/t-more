import { afterEach, describe, expect, it, vi } from 'vitest'
import { page } from 'vitest/browser'
import { cleanup, render } from 'vitest-browser-vue'

import TmCompositeSearch, {
  type TmCompositeSearchFieldItem,
  type TmCompositeSearchPayload,
} from '..'

const keywordField: TmCompositeSearchFieldItem = {
  type: 'input',
  name: '关键字',
  field: 'keyword',
  placeholder: '输入关键字',
}

const statusField: TmCompositeSearchFieldItem = {
  type: 'single',
  name: '状态',
  field: 'status',
  list: [
    { label: '启用', value: 1 },
    { label: '停用', value: 0 },
  ],
}

const tagsField: TmCompositeSearchFieldItem = {
  type: 'multiple',
  name: '标签',
  field: 'tags',
  list: [
    { label: '甲', value: 'a' },
    { label: '乙', value: 'b' },
  ],
}

const allFields = [keywordField, statusField, tagsField]

const labelText = (container: HTMLElement) =>
  container
    .querySelector('.tm-composite-search__search-label')
    ?.textContent?.trim()

const searchInput = (container: HTMLElement) =>
  container.querySelector<HTMLInputElement>(
    '.tm-composite-search__search-input input',
  )!

const isPopupOpen = () =>
  !!document.querySelector('.tm-composite-search__filter-pop-content-inner')

const checkedOf = (control: 'radio' | 'checkbox') =>
  [
    ...document.querySelectorAll<HTMLInputElement>(
      `.tm-composite-search__filter-pop-content-inner .t-${control} input`,
    ),
  ].map((input) => input.checked)

const renderSearch = async (
  options: {
    searchFields?: TmCompositeSearchFieldItem[]
    value?: TmCompositeSearchPayload[]
  } = {},
) => {
  const onSearch = vi.fn()
  const onReset = vi.fn()
  const result = await render(TmCompositeSearch, {
    props: {
      searchFields: options.searchFields ?? allFields,
      value: options.value ?? [],
      onSearch,
      onReset,
    },
  })
  return { result, onSearch, onReset }
}

const switchField = async (
  result: Awaited<ReturnType<typeof renderSearch>>['result'],
  name: string,
) => {
  await page
    .elementLocator(
      result.container.querySelector('.tm-composite-search__search-label')!,
    )
    .click()
  await result.getByText(name).click()
}

describe('TmCompositeSearch', () => {
  afterEach(cleanup)

  describe('searchFields', () => {
    it('renders nothing when searchFields is empty', async () => {
      const { result } = await renderSearch({ searchFields: [] })

      expect(result.container.querySelector('.tm-composite-search')).toBeNull()
    })

    it('shows the first field name by default', async () => {
      const { result } = await renderSearch()

      expect(labelText(result.container)).toBe('关键字')
    })

    it('resolves a lazy field name', async () => {
      const { result } = await renderSearch({
        searchFields: [{ ...keywordField, name: () => '惰性名' }],
      })

      expect(labelText(result.container)).toBe('惰性名')
    })

    it('opens the popup for filter fields and closes it for input fields', async () => {
      const { result, onSearch } = await renderSearch()

      await switchField(result, '状态')
      await expect.poll(isPopupOpen).toBe(true)
      expect(labelText(result.container)).toBe('状态')
      expect(
        result.container.querySelector('.t-radio-group--vertical'),
      ).not.toBeNull()

      await switchField(result, '关键字')
      await expect.poll(isPopupOpen).toBe(false)
      expect(labelText(result.container)).toBe('关键字')
      expect(onSearch).not.toHaveBeenCalled()
    })
  })

  describe('input field', () => {
    it('does nothing when the input is blank', async () => {
      const { result, onSearch } = await renderSearch()
      searchInput(result.container).value = '   '
      searchInput(result.container).dispatchEvent(
        new Event('input', { bubbles: true }),
      )

      await result.getByText('搜索').click()

      expect(onSearch).not.toHaveBeenCalled()
    })

    it('searches a trimmed value and clears the input', async () => {
      const { result, onSearch } = await renderSearch()
      searchInput(result.container).value = '  关键字1  '
      searchInput(result.container).dispatchEvent(
        new Event('input', { bubbles: true }),
      )

      await result.getByText('搜索').click()

      expect(onSearch).toHaveBeenCalledExactlyOnceWith({
        field: 'keyword',
        name: '关键字',
        value: '关键字1',
      })
      expect(searchInput(result.container).value).toBe('')
    })
  })

  describe('single field', () => {
    it('keeps the picked value temporary until confirmed', async () => {
      const { result, onSearch, onReset } = await renderSearch({
        searchFields: [statusField],
      })
      searchInput(result.container).click()
      await expect.poll(isPopupOpen).toBe(true)

      await result.getByText('停用').click()

      expect(checkedOf('radio')).toEqual([false, true])
      expect(onSearch).not.toHaveBeenCalled()
      expect(onReset).not.toHaveBeenCalled()

      await result.getByText('确认').click()

      await expect.poll(isPopupOpen).toBe(false)
      expect(onSearch).toHaveBeenCalledExactlyOnceWith({
        field: 'status',
        name: '状态',
        value: 0,
      })
    })

    it('resets the field and closes the popup', async () => {
      const { result, onReset } = await renderSearch({
        searchFields: [statusField],
      })
      searchInput(result.container).click()
      await expect.poll(isPopupOpen).toBe(true)
      await result.getByText('启用').click()

      await result.getByText('重置').click()

      await expect.poll(isPopupOpen).toBe(false)
      expect(onReset).toHaveBeenCalledExactlyOnceWith({
        field: 'status',
        name: '状态',
      })
    })

    it('resets instead of searching when nothing is picked', async () => {
      const { result, onSearch, onReset } = await renderSearch({
        searchFields: [statusField],
      })
      searchInput(result.container).click()
      await expect.poll(isPopupOpen).toBe(true)

      await result.getByText('确认').click()

      await expect.poll(isPopupOpen).toBe(false)
      expect(onSearch).not.toHaveBeenCalled()
      expect(onReset).toHaveBeenCalledExactlyOnceWith({
        field: 'status',
        name: '状态',
      })
    })
  })

  describe('multiple field', () => {
    it('searches an array of picked values', async () => {
      const { result, onSearch } = await renderSearch({
        searchFields: [tagsField],
      })
      searchInput(result.container).click()
      await expect.poll(isPopupOpen).toBe(true)

      await result.getByText('甲').click()
      await result.getByText('乙').click()

      expect(checkedOf('checkbox')).toEqual([true, true])

      await result.getByText('确认').click()

      await expect.poll(isPopupOpen).toBe(false)
      expect(onSearch).toHaveBeenCalledExactlyOnceWith({
        field: 'tags',
        name: '标签',
        value: ['a', 'b'],
      })
    })

    it('confirms when the search button is clicked', async () => {
      const { result, onSearch } = await renderSearch({
        searchFields: [tagsField],
      })
      searchInput(result.container).click()
      await expect.poll(isPopupOpen).toBe(true)
      await result.getByText('甲').click()

      await result.getByText('搜索').click()

      await expect.poll(isPopupOpen).toBe(false)
      expect(onSearch).toHaveBeenCalledExactlyOnceWith({
        field: 'tags',
        name: '标签',
        value: ['a'],
      })
    })

    it('drops the temporary value when the popup closes', async () => {
      const { result } = await renderSearch({ searchFields: [tagsField] })
      searchInput(result.container).click()
      await expect.poll(isPopupOpen).toBe(true)
      await result.getByText('甲').click()
      expect(checkedOf('checkbox')).toEqual([true, false])

      searchInput(result.container).click()
      await expect.poll(isPopupOpen).toBe(false)
      searchInput(result.container).click()
      await expect.poll(isPopupOpen).toBe(true)

      expect(checkedOf('checkbox')).toEqual([false, false])
    })
  })

  describe('value', () => {
    it('echoes an external value and follows its changes', async () => {
      const { result } = await renderSearch({
        searchFields: [statusField],
        value: [{ field: 'status', name: '状态', value: 1 }],
      })
      searchInput(result.container).click()
      await expect.poll(isPopupOpen).toBe(true)

      expect(checkedOf('radio')).toEqual([true, false])

      await result.rerender({
        searchFields: [statusField],
        value: [{ field: 'status', name: '状态', value: 0 }],
      })

      expect(checkedOf('radio')).toEqual([false, true])
    })
  })
})
