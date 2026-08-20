import type { App, Plugin } from 'vue'
import { INSTALLED_KEY } from '@tailor-more/t-more-constants'

export const makeInstaller = (components: Plugin[] = []) => {
  const install = (app: App) => {
    if (app[INSTALLED_KEY]) return

    app[INSTALLED_KEY] = true
    components.forEach((comp) => app.use(comp))
  }
  return {
    install,
  }
}
