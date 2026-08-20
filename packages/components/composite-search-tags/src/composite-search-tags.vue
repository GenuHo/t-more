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
import type { TmCompositeSearchPayload } from '@tailor-more/t-more-components'
import type { TmCompositeSearchTagsProps } from './composite-search-tags-type'

defineOptions({
  name: 'TmCompositeSearchTags',
})

const { t } = useLocale()

const ns = useNamespace('composite-search-tags')

const props = defineProps<TmCompositeSearchTagsProps>()

const getTagText = (tag: TmCompositeSearchPayload) => {
  let text = tag.name + t('tm.compositeSearchTags.nameLabelSplit')
  if (typeof tag.label === 'string') {
    text = `${text}${tag.label}`
  } else if (Array.isArray(tag.label)) {
    text = `${text}${tag.label.join(t('tm.compositeSearchTags.labelSplit'))}`
  }
  return text
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
