import { afterEach, describe, expect, it } from 'vitest'

import { useCollapseAnimation } from '..'

const { beforeEnter, enter, afterEnter, beforeLeave, leave, afterLeave } =
  useCollapseAnimation()

const mounted: HTMLElement[] = []

// 生产里折叠内容就是个 auto height 的 div，滚动高度由内层内容撑出来
function createEl(contentHeight?: number) {
  const el = document.createElement('div')
  el.style.overflow = 'visible'

  if (contentHeight !== undefined) {
    const inner = document.createElement('div')
    inner.style.height = `${contentHeight}px`
    el.appendChild(inner)
  }

  document.body.appendChild(el)
  mounted.push(el)
  return el
}

afterEach(() => {
  mounted.splice(0).forEach((el) => el.remove())
})

// dataset 是 hook 自己的记账，往返后不复位，所以只比 inline style
function readStyle(el: HTMLElement) {
  const { style } = el
  return {
    height: style.height,
    paddingTop: style.paddingTop,
    paddingBottom: style.paddingBottom,
    overflow: style.overflow,
  }
}

describe('leave', () => {
  it('collapses the element when it has content', () => {
    const el = createEl(120)
    el.style.paddingTop = '4px'

    leave(el)

    expect(el.style.height).toBe('0px') // CSSOM 会把 '0' 归一成 '0px'
    expect(el.style.paddingTop).toBe('0px')
  })

  it('leaves an element with no content alone', () => {
    // 不能加 padding：padding 会算进 scrollHeight，守卫就不跳过了
    const el = createEl()

    leave(el)

    expect(el.style.height).toBe('')
    expect(el.style.paddingTop).toBe('')
  })
})

describe('enter and leave cycle', () => {
  it('gives the element back exactly as it was', () => {
    const el = createEl(120)
    el.style.paddingTop = '4px'
    el.style.paddingBottom = '8px'
    const original = readStyle(el)

    beforeEnter(el)
    enter(el)
    // 确认真的展开了；否则 jsdom 下 scrollHeight 恒为 0，这条会假通过
    expect(el.style.height).not.toBe('0px')
    afterEnter(el)

    beforeLeave(el)
    leave(el)
    afterLeave(el)

    expect(readStyle(el)).toEqual(original)
  })
})
