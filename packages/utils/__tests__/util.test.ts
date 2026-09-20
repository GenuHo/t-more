import { describe, expect, it } from 'vitest'

import { deleteObjectKeys, getFirstDefined } from '..'

describe('getFirstDefined', () => {
  it('returns the first argument that is not undefined', () => {
    expect(getFirstDefined(undefined, undefined, 3, 4)).toBe(3)
  })

  it('keeps other falsy values', () => {
    expect(getFirstDefined(undefined, null, 0, '')).toBeNull()
  })

  it('returns undefined when nothing is defined', () => {
    expect(getFirstDefined(undefined, undefined)).toBeUndefined()
    expect(getFirstDefined()).toBeUndefined()
  })
})

describe('deleteObjectKeys', () => {
  it('removes the listed keys in place', () => {
    const props: Record<string, unknown> = { a: 1, b: 2, c: 3 }

    deleteObjectKeys(props, ['a', 'c'])

    expect(props).toEqual({ b: 2 })
  })

  it('matches keys by their camelized form', () => {
    const props: Record<string, unknown> = { fooBar: 1, other: 2 }

    deleteObjectKeys(props, ['foo-bar'])

    expect(props).toEqual({ other: 2 })
  })

  it('leaves keys that camelize differently untouched', () => {
    const props: Record<string, unknown> = { foo_bar: 1 }

    // camelize 只处理连字符，下划线不参与
    deleteObjectKeys(props, ['foo-bar'])

    expect(props).toEqual({ foo_bar: 1 })
  })

  it('returns undefined', () => {
    const props: Record<string, unknown> = { a: 1 }

    expect(deleteObjectKeys(props, ['a'])).toBeUndefined()
    expect(props).toEqual({})
  })
})
