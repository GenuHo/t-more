<template>
  <div class="basic-example">
    <tm-button-dropdown :buttons="buttons1" :max="-1" />
    <tm-button-dropdown :buttons="buttons2" :max="5" />
    <tm-button-dropdown
      :buttons="buttons3"
      :button-props="{ theme: 'default', variant: 'outline' }"
    />
  </div>
</template>

<script setup lang="ts">
import type { TmButtonDropdownItem } from 'tdesign-vue-next-more'

const buttons1: TmButtonDropdownItem[] = [
  {
    content: 'base 1-1',
    onClick: () => MessagePlugin.success('base 1-1 clicked'),
    variant: 'base',
  },
  {
    content: 'outline 1-2',
    onClick: () => MessagePlugin.success('outline 1-2 clicked'),
    variant: 'outline',
  },
  {
    content: 'dashed 1-3',
    onClick: () => MessagePlugin.success('dashed 1-3 clicked'),
    variant: 'dashed',
  },
  {
    content: 'text 1-4',
    onClick: () => MessagePlugin.success('text 1-4 clicked'),
    variant: 'text',
  },
]

const buttons2: TmButtonDropdownItem[] = [
  {
    content: 'primary 2-1',
    onClick: () => MessagePlugin.success('primary 2-1 clicked'),
    theme: 'primary',
  },
  {
    content: 'default 2-2',
    onClick: () => MessagePlugin.success('default 2-2 clicked'),
    theme: 'default',
  },
  {
    content: 'danger 2-3',
    onClick: () => MessagePlugin.success('danger 2-3 clicked'),
    theme: 'danger',
  },
  {
    content: 'warning 2-4',
    onClick: () => MessagePlugin.success('warning 2-4 clicked'),
    theme: 'warning',
  },
  {
    content: 'success 2-5',
    onClick: () => MessagePlugin.success('success 2-5 clicked'),
    theme: 'success',
  },
]

const buttons3: TmButtonDropdownItem[] = [
  {
    content: 'Action 3-1',
    onClick: () => MessagePlugin.success('Action 3-1 clicked'),
    theme: 'primary',
  },
  {
    content: 'Action 3-2',
    onClick: () => MessagePlugin.success('Action 3-2 clicked'),
  },
  {
    content: 'Action 3-3',
    onClick: () => MessagePlugin.success('Action 3-3 clicked'),
    theme: 'danger',
    variant: 'dashed',
  },
]
</script>

<style scoped>
.basic-example {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
</style>
