import { afterEach, describe, expect, it, vi } from 'vitest'

import { debugWarn, throwError } from '..'

afterEach(() => {
  vi.unstubAllEnvs()
  vi.restoreAllMocks()
})

describe('throwError', () => {
  it('prefixes the message with the scope', () => {
    expect(() => throwError('TmTable', 'boom')).toThrow('[TmTable] boom')
  })

  it('throws a TMoreError', () => {
    let error: unknown

    try {
      throwError('TmTable', 'boom')
    } catch (e) {
      error = e
    }

    expect(error).toBeInstanceOf(Error)
    expect((error as Error).name).toBe('TMoreError')
  })

  it('throws in production too', () => {
    vi.stubEnv('NODE_ENV', 'production')

    expect(() => throwError('TmTable', 'boom')).toThrow('[TmTable] boom')
  })
})

describe('debugWarn', () => {
  it('warns with the scope prefix outside production', () => {
    const warn = vi.spyOn(console, 'warn')

    debugWarn('TmTable', 'boom')

    expect(warn).toHaveBeenCalledTimes(1)
    const error = warn.mock.calls[0][0] as Error
    expect(error.name).toBe('TMoreError')
    expect(error.message).toBe('[TmTable] boom')
  })

  it('warns a given Error as-is', () => {
    const warn = vi.spyOn(console, 'warn')
    const error = new Error('boom')

    debugWarn(error)

    expect(warn).toHaveBeenCalledWith(error)
  })

  it('stays silent in production', () => {
    vi.stubEnv('NODE_ENV', 'production')
    const warn = vi.spyOn(console, 'warn')

    debugWarn('TmTable', 'boom')

    expect(warn).not.toHaveBeenCalled()
  })
})
