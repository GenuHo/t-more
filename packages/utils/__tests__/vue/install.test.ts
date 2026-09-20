import { describe, expect, it, vi } from 'vitest'
import { createApp, defineComponent } from 'vue'

import { withInstall } from '../..'

const Foo = defineComponent({ name: 'TmFoo', render: () => null })
const Bar = defineComponent({ name: 'TmBar', render: () => null })

function createAppWithSpy() {
  const app = createApp({})
  return { app, component: vi.spyOn(app, 'component') }
}

describe('withInstall', () => {
  it('registers the component when the plugin is used', () => {
    const { app, component } = createAppWithSpy()

    app.use(withInstall(Foo))

    expect(component).toHaveBeenCalledWith('TmFoo', Foo)
  })

  it('registers the extra components too', () => {
    const { app, component } = createAppWithSpy()

    app.use(withInstall(Foo, { Bar }))

    expect(component).toHaveBeenCalledTimes(2)
    expect(component).toHaveBeenCalledWith('TmBar', Bar)
  })

  it('exposes the extra components on the returned value', () => {
    const Installed = withInstall(Foo, { Bar })

    expect(Installed.Bar).toBe(Bar)
  })

  it('returns the main component itself', () => {
    expect(withInstall(Foo)).toBe(Foo)
  })
})
