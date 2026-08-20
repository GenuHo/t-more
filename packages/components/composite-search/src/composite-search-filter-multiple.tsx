import '@tailor-more/t-more-theme-chalk/composite-search-filter-multiple.less'

import { useNamespace } from '@tailor-more/t-more-hooks'
import { defineComponent } from 'vue'
import type { TmCompositeSearchFilterMultipleProps } from './composite-search-filter-multiple-type'

export default defineComponent<TmCompositeSearchFilterMultipleProps>({
  name: 'TmCompositeSearchFilterMultiple',
  inheritAttrs: false,
  setup(props, { attrs, slots }) {
    const ns = useNamespace('composite-search-filter-multiple')

    return () => {
      return (
        <div class={ns.b()}>
          <TCheckboxGroup v-slots={slots} {...attrs}></TCheckboxGroup>
        </div>
      )
    }
  },
})
