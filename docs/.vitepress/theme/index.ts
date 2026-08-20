// https://vitepress.dev/guide/custom-theme
import { h } from 'vue'
import type { Theme } from 'vitepress'
import DefaultTheme from 'vitepress/theme'
import './style.css'
import VpDemo from '../vitepress/components/vp-demo.vue'
import TMore from '@tailor-more/t-more'

export default {
  extends: DefaultTheme,
  Layout: () => {
    return h(DefaultTheme.Layout, null, {
      // https://vitepress.dev/guide/extending-default-theme#layout-slots
    })
  },
  enhanceApp({ app /* router, siteData */ }) {
    app.component('Demo', VpDemo)
    app.use(TMore)
  },
} satisfies Theme
