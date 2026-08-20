<template>
  <template v-if="!source">
    <div>{{ locale['component-demo-under-construction'] }}</div>
  </template>
  <template v-else>
    <div v-html="description" />
    <div class="example">
      <div class="showcase vp-raw">
        <slot name="source"></slot>
      </div>
      <div class="operation vp-raw">
        <t-space size="small">
          <t-button shape="square" variant="text" @click="copyCode">
            <copy-icon />
          </t-button>
          <t-button
            shape="square"
            variant="text"
            @click="codeVisible = !codeVisible"
          >
            <code-icon />
          </t-button>
        </t-space>
      </div>
      <TmCollapseTransition>
        <div class="code" v-show="codeVisible" v-html="source"></div>
      </TmCollapseTransition>
    </div>
  </template>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useLang } from '../hooks/use-lang'
import vpDemoLocale from '../../locale/vp-components/vp-demo.json'
import { useClipboard } from '@vueuse/core'
import { MessagePlugin } from 'tdesign-vue-next'
import { TmCollapseTransition } from '@tailor-more/t-more-components'

const lang = useLang()
const locale = computed(
  () => vpDemoLocale[lang.value as keyof typeof vpDemoLocale],
)

const props = defineProps<{
  source?: string
  path?: string
  rawSource?: string
  description?: string
}>()

const source = computed(() => {
  return decodeURIComponent(props.source || '')
})
// const path = computed(() => {
//   return decodeURIComponent(props.path || '')
// })
const rawSource = computed(() => {
  return decodeURIComponent(props.rawSource || '')
})
const description = computed(() => {
  return decodeURIComponent(props.description || '')
})

const codeVisible = ref(false)

const { copy, isSupported } = useClipboard({
  source: rawSource.value,
  read: false,
})

const copyCode = async () => {
  if (!isSupported) {
    MessagePlugin.error(locale.value['not-support-copy-error'])
  }
  try {
    await copy()
    MessagePlugin.success(locale.value['copy-success'])
  } catch (e: any) {
    MessagePlugin.error(e.message)
  }
}
</script>

<style lang="less" scoped>
.example {
  border: 1px solid var(--td-component-border);
  border-radius: var(--td-radius-default);

  .showcase {
    padding: var(--td-comp-margin-xl);
    background-color: var(--td-bg-color-container);
  }

  .operation {
    display: flex;
    justify-content: flex-end;
    margin-right: var(--td-comp-margin-s);
    margin-bottom: var(--td-comp-margin-s);
  }

  .code {
    :deep(div[class*='language-']) {
      margin: 0;
      border-radius: 0;
    }
  }
}
</style>
