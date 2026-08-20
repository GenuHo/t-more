import '@tailor-more/t-more-theme-chalk/composite-search-filter-single.less'

import { useNamespace } from '@tailor-more/t-more-hooks'
import { defineComponent } from 'vue'
import type { TmCompositeSearchFilterSingleProps } from './composite-search-filter-single-type'

/**
 * 单选筛选
 * 这里 defineComponent 直接声明出来Props，然后往下传参直接用 attrs 传给TRadioGroup，这样保证
 * 如果直接传props给下层，props中会有所有的属性的key，会产生的问题是，肯定会传相关的value和modelValue到下层
 * 下层的 useVModel 判定 getCurrentInstance().vnode.props 中是否有 modelValue model-value value，就肯定会包含其中，按照优先级就会使用 modelValue
 * 但是这个modelValue所在层是封装层（从上到下依次是使用层、封装层、被封装层），update:modelValue 通过{...attrs}会到使用层，使用层没有相关定义就没有效果切换选中的效果了
 */
export default defineComponent<TmCompositeSearchFilterSingleProps>({
  name: 'TmCompositeSearchFilterSingle',
  inheritAttrs: false,
  setup(props, { attrs, slots }) {
    const ns = useNamespace('composite-search-filter-single')

    return () => {
      return (
        <div class={ns.b()}>
          {
            <TRadioGroup
              v-slots={slots}
              {...attrs}
              direction="vertical"
            ></TRadioGroup>
          }
        </div>
      )
    }
  },
})
