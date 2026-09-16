import '@tailor-more/t-more-theme-chalk/composite-search-filter-multiple.less'

import { useNamespace } from '@tailor-more/t-more-hooks'
import { defineComponent, getCurrentInstance } from 'vue'
import type { TmCompositeSearchFilterMultipleProps } from './composite-search-filter-multiple-type'
import tCheckboxGroupProps from 'tdesign-vue-next/es/checkbox/checkbox-group-props'

export default defineComponent<TmCompositeSearchFilterMultipleProps>({
  name: 'TmCompositeSearchFilterMultiple',
  props: {
    ...tCheckboxGroupProps,
  },
  setup(_, { attrs, slots }) {
    const ns = useNamespace('composite-search-filter-multiple')
    const instance = getCurrentInstance()
    return () => {
      // 直接拿setup的props拿到的会含有上层没有传的属性的key也在其中，会导致下层有问题，下层是根据是否有对应的key判定用户是否有传对应的字段
      // 具体见tdesign-vue-next的useVModel
      // https://github.com/Tencent/tdesign-vue-next/blob/develop/packages/shared/hooks/useVModel/index.ts
      const props = instance?.vnode.props
      return (
        <div class={ns.b()}>
          <TCheckboxGroup
            v-slots={slots}
            {...props}
            {...attrs}
          ></TCheckboxGroup>
        </div>
      )
    }
  },
})
