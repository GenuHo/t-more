import '@tailor-more/t-more-theme-chalk/composite-search-filter-single.less'

import { useNamespace } from '@tailor-more/t-more-hooks'
import { defineComponent, getCurrentInstance } from 'vue'
import type { TmCompositeSearchFilterSingleProps } from './composite-search-filter-single-type'
import tRadioGroupProps from 'tdesign-vue-next/es/radio/radio-group-props'

export default defineComponent<TmCompositeSearchFilterSingleProps>({
  name: 'TmCompositeSearchFilterSingle',
  props: {
    ...tRadioGroupProps,
  },
  setup(_, { attrs, slots }) {
    const ns = useNamespace('composite-search-filter-single')
    const instance = getCurrentInstance()
    return () => {
      // 直接拿setup的props拿到的会含有上层没有传的属性的key也在其中，会导致下层有问题，下层是根据是否有对应的key判定用户是否有传对应的字段
      // 具体见tdesign-vue-next的useVModel
      // https://github.com/Tencent/tdesign-vue-next/blob/develop/packages/shared/hooks/useVModel/index.ts
      const props = instance?.vnode.props
      return (
        <div class={ns.b()}>
          {
            <TRadioGroup
              v-slots={slots}
              {...props}
              {...attrs}
              direction="vertical"
            ></TRadioGroup>
          }
        </div>
      )
    }
  },
})
