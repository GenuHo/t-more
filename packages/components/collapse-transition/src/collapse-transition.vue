<template>
  <transition :name="ns.b()" v-on="on">
    <slot></slot>
  </transition>
</template>

<script lang="ts" setup>
import { useCollapseAnimation, useNamespace } from '@tailor-more/t-more-hooks'

defineOptions({
  name: 'TmCollapseTransition',
})

const ns = useNamespace('collapse-transition')

const on = useCollapseAnimation()
</script>

<style lang="less">
@import url('@tailor-more/t-more-theme-chalk/collapse-transition.less');
</style>
