import { describe, expect, it } from 'vitest'

import { getFirstDefined } from '..'

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
