import { afterEach, describe, expect, it, vi } from 'vitest'
import { cleanup, render } from 'vitest-browser-vue'

import TmButtonDropdown from '..'

afterEach(cleanup)

const buttons = [
  { content: 'A' },
  { content: 'B' },
  { content: 'C' },
  { content: 'D' },
]

const labels = (root: ParentNode) =>
  [...root.querySelectorAll('button')].map((b) => b.textContent?.trim())

// 浮层挂在 body 上
const menuLabels = () =>
  [...document.body.querySelectorAll('.t-dropdown__item-text')].map((n) =>
    n.textContent?.trim(),
  )

const menuItem = (label: string) =>
  [...document.body.querySelectorAll<HTMLElement>('.t-dropdown__item')].find(
    (el) =>
      el.querySelector('.t-dropdown__item-text')?.textContent?.trim() === label,
  )!

const isDisabled = (label: string) =>
  menuItem(label).classList.contains('t-dropdown__item--disabled')

describe('max', () => {
  it('folds the overflow into a more button by default', async () => {
    const { container } = await render(TmButtonDropdown, { props: { buttons } })

    expect(container.querySelector('.tm-button-dropdown')).not.toBeNull()
    // 默认 max 是 3：2 个按钮 + 更多
    expect(labels(container)).toEqual(['A', 'B', '更多'])
  })

  it('renders every button when max is negative', async () => {
    const { container } = await render(TmButtonDropdown, {
      props: { buttons, max: -1 },
    })

    expect(labels(container)).toEqual(['A', 'B', 'C', 'D'])
  })

  it('renders nothing when max is 0', async () => {
    const { container } = await render(TmButtonDropdown, {
      props: { buttons, max: 0 },
    })

    expect(labels(container)).toEqual([])
  })

  it('renders every button when they fit', async () => {
    const { container } = await render(TmButtonDropdown, {
      props: { buttons, max: 4 },
    })

    expect(labels(container)).toEqual(['A', 'B', 'C', 'D'])
  })
})

describe('buttonProps', () => {
  it('applies to every button and can be overridden per button', async () => {
    const { container } = await render(TmButtonDropdown, {
      props: {
        max: -1,
        buttonProps: { theme: 'danger', disabled: true },
        buttons: [
          { content: 'A' },
          { content: 'B', theme: 'success', disabled: false },
        ],
      },
    })

    const [first, second] = [...container.querySelectorAll('button')]

    expect(first).toHaveClass('t-button--theme-danger')
    expect((first as HTMLButtonElement).disabled).toBe(true)
    expect(second).toHaveClass('t-button--theme-success')
    expect((second as HTMLButtonElement).disabled).toBe(false)
  })

  it('does not leak its own keys onto the button', async () => {
    const { container } = await render(TmButtonDropdown, {
      props: {
        max: -1,
        buttons: [
          {
            content: 'A',
            children: [{ content: 'A1' }],
            dropdownProps: { trigger: 'click' },
            dropdownItemProps: { theme: 'default' },
            tooltipProps: { content: 'tip' },
          },
        ],
      },
    })

    for (const key of [
      'children',
      'dropdownprops',
      'dropdownitemprops',
      'tooltipprops',
    ]) {
      expect(container.querySelector('button')).not.toHaveAttribute(key)
    }
  })

  it('calls onClick with the event', async () => {
    const onClick = vi.fn()
    const { getByText } = await render(TmButtonDropdown, {
      props: { max: -1, buttons: [{ content: 'A', onClick }] },
    })

    await getByText('A').click()

    expect(onClick).toHaveBeenCalledTimes(1)
    expect(onClick.mock.calls[0][0]).toBeInstanceOf(MouseEvent)
  })
})

describe('dropdown menu', () => {
  async function openMenu() {
    const result = await render(TmButtonDropdown, {
      props: {
        max: -1,
        buttons: [
          {
            content: 'P',
            children: [
              { content: 'C1' },
              { content: 'C2', disabled: true },
              { content: 'C3', dropdownItemProps: { disabled: true } },
              { content: 'C4', children: [{ content: 'C4a' }] },
            ],
          },
        ],
      },
    })

    await result.getByText('P').click()
    return result
  }

  it('renders the children, including disabled and nested ones', async () => {
    await openMenu()

    await expect.poll(menuLabels).toEqual(['C1', 'C2', 'C3', 'C4', 'C4a'])
    // 浮层挂在 body 上，样式只能靠这个类名定位
    expect(
      document.body.querySelector('.tm-button-dropdown__popup-inner'),
    ).not.toBeNull()
    expect(isDisabled('C2')).toBe(true)
    expect(isDisabled('C3')).toBe(true)
    expect(isDisabled('C1')).toBe(false)
  })

  it('forwards a click to the button onClick with the event', async () => {
    const onClick = vi.fn()
    const { getByText } = await render(TmButtonDropdown, {
      props: {
        max: -1,
        buttons: [
          {
            content: 'P',
            children: [{ content: 'C1', onClick }],
          },
        ],
      },
    })

    await getByText('P').click()
    await expect.poll(menuLabels).toEqual(['C1'])
    await getByText('C1').click()

    expect(onClick).toHaveBeenCalledTimes(1)
    expect(onClick.mock.calls[0][0]).toBeInstanceOf(MouseEvent)
  })
})

describe('moreButtonProps', () => {
  it('renders a custom label and forwards the rest to the button', async () => {
    const { container } = await render(TmButtonDropdown, {
      props: {
        max: 2,
        buttons,
        moreButtonProps: { content: 'MORE', theme: 'danger' },
      },
    })

    expect(labels(container)).toEqual(['A', 'MORE'])
    expect(container.querySelectorAll('button')[1]).toHaveClass(
      't-button--theme-danger',
    )
  })

  it('renders a TNode content', async () => {
    const { container } = await render(TmButtonDropdown, {
      props: {
        max: 2,
        buttons,
        moreButtonProps: {
          content: (createElement) => createElement('span', 'X'),
        },
      },
    })

    expect(labels(container)).toEqual(['A', 'X'])
  })

  it('puts the overflow buttons in the more menu', async () => {
    const { getByText } = await render(TmButtonDropdown, {
      props: {
        max: 2,
        buttons: [
          { content: 'A' },
          { content: 'B', children: [{ content: 'B1' }] },
          { content: 'C' },
        ],
      },
    })

    await getByText('更多').click()

    await expect.poll(menuLabels).toEqual(['B', 'B1', 'C'])
  })
})
