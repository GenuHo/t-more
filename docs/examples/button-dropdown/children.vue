<template>
  <div class="children-example">
    <tm-button-dropdown
      :buttons="buttons1"
      :more-button-props="moreButtonProps1"
    ></tm-button-dropdown>
  </div>
</template>

<script setup lang="ts">
import type {
  TmButtonDropdownItem,
  TmButtonDropdownProps,
} from '@tailor-more/t-more'

const buttons1: TmButtonDropdownItem[] = [
  {
    content: 'Action 1-1',
    onClick: () => MessagePlugin.success('Action 1-1 clicked'),
    dropdownProps: {
      maxColumnWidth: 300,
    },
    children: [
      {
        content: 'Action 1-1-1',
        onClick: () => MessagePlugin.success('Action 1-1-1 clicked'),
      },
      {
        content: 'Action 1-1-2',
        onClick: () => MessagePlugin.success('Action 1-1-2 clicked'),
        children: [
          {
            content: 'Action 1-1-2-1',
            onClick: () => MessagePlugin.success('Action 1-1-2-1 clicked'),
          },
          {
            content: 'Action 1-1-2-2',
            onClick: () => MessagePlugin.success('Action 1-1-2-2 clicked'),
          },
        ],
      },
    ],
  },
  {
    content: 'Action 1-2',
    onClick: () => MessagePlugin.success('Action 1-2 clicked'),
  },
  {
    content: 'Action 1-3',
    onClick: () => MessagePlugin.success('Action 1-3 clicked'),
  },
  {
    content: 'Action 1-4',
    onClick: () => MessagePlugin.success('Action 1-4 clicked'),
    children: [
      {
        content: 'Action 1-4-1',
        onClick: () => MessagePlugin.success('Action 1-4-1 clicked'),
      },
      {
        content: 'Action 1-4-2',
        onClick: () => MessagePlugin.success('Action 1-4-2 clicked'),
      },
    ],
  },
]
const moreButtonProps1: TmButtonDropdownProps['moreButtonProps'] = {
  dropdownProps: {
    maxColumnWidth: 300,
  },
}
</script>

<style scoped>
.children-example {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
</style>
