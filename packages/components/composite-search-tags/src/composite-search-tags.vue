<template>
  <div :class="ns.b()" v-if="value && value.length > 0">
    <t-space size="small" break-line>
      <t-tag
        variant="outline"
        :class="ns.e('tag')"
        closable
        v-for="tag in value"
        :key="tag.field"
        @close="handleClose(tag)"
      >
        {{ getTagText(tag) }}
      </t-tag>
      <!-- 这里使用t-tag，是为了保持这里的高度和其他tag严格一致 -->
      <t-tag
        :class="[ns.e('operation-tag'), ns.em('operation-tag', 'clear')]"
        @click="handleClear"
      >
        {{ t('tm.compositeSearchTags.clear') }}
      </t-tag>
    </t-space>
  </div>
</template>

<script lang="ts" setup>
import { useNamespace, useLocale } from '@tailor-more/t-more-hooks'
import type {
  TmCompositeSearchFieldItem,
  TmCompositeSearchPayload,
} from '@tailor-more/t-more-components'
import type { TmCompositeSearchTagsProps } from './composite-search-tags-type'

defineOptions({
  name: 'TmCompositeSearchTags',
})

const { t } = useLocale()

const ns = useNamespace('composite-search-tags')

const props = defineProps<TmCompositeSearchTagsProps>()

const getFieldConfig = (
  field: string,
): TmCompositeSearchFieldItem | undefined => {
  return props.searchFields?.find((item) => item.field === field)
}

// 字段展示名：与顶部搜索一致，从 searchFields 反查（name 支持惰性函数），
// 找不到对应字段配置时兜底用载荷自带的 name —— 避免默认筛选/表头筛选产生的
// 载荷因缺 searchConfig.name 而显示成 undefined
const getFieldName = (tag: TmCompositeSearchPayload): string => {
  const fieldConfig = getFieldConfig(tag.field)
  const name = fieldConfig ? fieldConfig.name : tag.name
  return typeof name === 'function' ? name() : (name ?? '')
}

const getValueText = (
  fieldConfig: TmCompositeSearchFieldItem | undefined,
  value: unknown,
): string => {
  if (fieldConfig?.type === 'single' || fieldConfig?.type === 'multiple') {
    const item = fieldConfig.list.find((option) => {
      const optionValue = option.value
      return optionValue === value
    })
    if (item === undefined) return ''
    return item.label ?? ''
  }
  return String(value)
}

const getTagText = (tag: TmCompositeSearchPayload) => {
  const fieldConfig = getFieldConfig(tag.field)
  let valueText: string
  if (Array.isArray(tag.value)) {
    valueText = tag.value
      .map((item) => getValueText(fieldConfig, item))
      .join(t('tm.compositeSearchTags.labelSplit'))
  } else {
    valueText = getValueText(fieldConfig, tag.value)
  }
  return (
    getFieldName(tag) + t('tm.compositeSearchTags.nameLabelSplit') + valueText
  )
}

const handleClose = (tag: TmCompositeSearchPayload) => {
  props?.onClose?.(tag)
}

const handleClear = () => {
  props?.onClear?.()
}
</script>

<style lang="less">
@import url('@tailor-more/t-more-theme-chalk/composite-search-tags.less');
</style>
