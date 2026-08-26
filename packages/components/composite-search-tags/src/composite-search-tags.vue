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
import type { OptionData } from 'tdesign-vue-next'
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

const getOptionLabel = (
  list: OptionData[] | undefined,
  value: unknown,
): string => {
  const item = list?.find((option) => {
    const optionValue =
      typeof option === 'object' && option !== null ? option.value : option
    return optionValue === value
  })
  if (item === undefined) return String(value)
  return typeof item === 'object' ? (item.label ?? String(value)) : String(item)
}

const getTagText = (tag: TmCompositeSearchPayload) => {
  const fieldConfig = getFieldConfig(tag.field)
  const list =
    fieldConfig?.type === 'single' || fieldConfig?.type === 'multiple'
      ? fieldConfig.list
      : undefined
  let valueText: string
  if (Array.isArray(tag.value)) {
    valueText = tag.value
      .map((item) => getOptionLabel(list, item))
      .join(t('tm.compositeSearchTags.labelSplit'))
  } else {
    valueText = getOptionLabel(list, tag.value)
  }
  return tag.name + t('tm.compositeSearchTags.nameLabelSplit') + valueText
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
