<template>
  <div class="disabled-tooltip-example">
    <tm-button-dropdown :buttons="buttons"></tm-button-dropdown>
  </div>
</template>

<script setup lang="ts">
import type { TmButtonDropdownItem } from '@tailor-more/t-more'

const buttons: TmButtonDropdownItem[] = [
  {
    content: 'Action 1-1',
    onClick: () => MessagePlugin.success('Action 1-1 clicked'),
    theme: 'primary',
    disabled: true,
    tooltipProps: {
      content: 'Action 1-1 is disabled',
    },
  },
  {
    content: 'Action 1-2',
    onClick: () => MessagePlugin.success('Action 1-2 clicked'),
  },
  {
    content: 'Action 1-3',
    onClick: () => MessagePlugin.success('Action 1-3 clicked'),
    disabled: true,
    tooltipProps: {
      content: 'Action 1-3 is disabled',
    },
  },
  {
    content: 'Action 1-4',
    onClick: () => MessagePlugin.success('Action 1-4 clicked'),
    dropdownItemProps: {
      disabled: true,
    },
    tooltipProps: {
      content: 'Action 1-4 is disabled',
    },
  },
  {
    content: 'Action 1-5',
    onClick: () => MessagePlugin.success('Action 1-5 clicked'),
    disabled: false,
    dropdownItemProps: {
      disabled: true,
    },
  },
]
</script>

<style scoped>
.disabled-tooltip-example {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
</style>
