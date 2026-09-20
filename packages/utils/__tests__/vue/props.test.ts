import { describe, expect, it } from 'vitest'

import { deleteOwnProps } from '../..'

describe('deleteOwnProps', () => {
  it('removes the listed keys in place', () => {
    const props: Record<string, unknown> = { a: 1, b: 2, c: 3 }

    deleteOwnProps(props, ['a', 'c'])

    expect(props).toEqual({ b: 2 })
  })

  it('matches keys by their camelized form', () => {
    const props: Record<string, unknown> = { fooBar: 1, other: 2 }

    deleteOwnProps(props, ['foo-bar'])

    expect(props).toEqual({ other: 2 })
  })

  it('leaves keys that camelize differently untouched', () => {
    const props: Record<string, unknown> = { foo_bar: 1 }

    // camelize 只处理连字符，下划线不参与
    deleteOwnProps(props, ['foo-bar'])

    expect(props).toEqual({ foo_bar: 1 })
  })

  it('returns undefined', () => {
    const props: Record<string, unknown> = { a: 1 }

    expect(deleteOwnProps(props, ['a'])).toBeUndefined()
    expect(props).toEqual({})
  })
})
