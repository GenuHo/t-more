<template>
  <div class="fold-example">
    <tm-button-dropdown
      :buttons="buttons1"
      :button-props="{ theme: 'default' }"
    />
    <tm-button-dropdown
      :buttons="buttons2"
      :button-props="{ theme: 'default', variant: 'outline' }"
      :more-button-props="moreButtonProps2"
      :max="2"
    />
    <tm-button-dropdown
      :buttons="buttons2"
      :button-props="{ theme: 'default', variant: 'dashed' }"
      :more-button-props="moreButtonProps2"
      :max="1"
    />
  </div>
</template>

<script setup lang="tsx">
import type {
  TmButtonDropdownItem,
  TmButtonDropdownProps,
} from '@tailor-more/t-more'

const buttons1: TmButtonDropdownItem[] = [
  {
    content: 'Action 1-1',
    onClick: () => MessagePlugin.success('Action 1-1 clicked'),
    theme: 'primary',
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
  },
]

const buttons2: TmButtonDropdownItem[] = [
  {
    content: 'Action 2-1',
    onClick: () => MessagePlugin.success('Action 2-1 clicked'),
    theme: 'primary',
    variant: 'base',
  },
  {
    content: 'Action 2-2',
    onClick: () => MessagePlugin.success('Action 2-2 clicked'),
  },
  {
    content: 'Action 2-3',
    onClick: () => MessagePlugin.success('Action 2-3 clicked'),
  },
  {
    content: 'Action 2-4',
    onClick: () => MessagePlugin.success('Action 2-4 clicked'),
  },
  {
    content: 'Action 2-5',
    onClick: () => MessagePlugin.success('Action 2-5 clicked'),
  },
]
const moreButtonProps2: TmButtonDropdownProps['moreButtonProps'] = {
  theme: 'primary',
  variant: 'base',
  shape: 'square',
  content: () => {
    return <MoreIcon />
  },
  suffix: () => undefined,
}
</script>

<style scoped>
.fold-example {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
</style>
