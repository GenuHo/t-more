<template>
  <div class="example-single-multiple">
    <t-space direction="vertical">
      <div>search params: {{ getSearchParams() }}</div>
      <tm-composite-search v-bind="compositeSearchProps"></tm-composite-search>
    </t-space>
  </div>
</template>

<script setup lang="ts">
import type { TmCompositeSearchFieldItem } from '@tailor-more/t-more'
import { useCompositeSearch } from '@tailor-more/t-more'

const searchFields: TmCompositeSearchFieldItem[] = [
  {
    type: 'input',
    name: 'id',
    field: 'id',
    placeholder: 'please input id',
  },
  {
    type: 'single',
    name: 'gender',
    field: 'gender',
    placeholder: 'please select gender',
    list: [
      { label: 'male', value: 'male' },
      { label: 'female', value: 'female' },
    ],
  },
  {
    type: 'multiple',
    name: 'status',
    field: 'status',
    placeholder: 'please select status',
    list: [
      { label: 'normal', value: 1 },
      { label: 'disabled', value: 2 },
    ],
  },
]

const { compositeSearchProps, getSearchParams } = useCompositeSearch({
  searchFields,
  onSearchChange: (searchParams) => {
    console.log('searchParams: ', searchParams)
  },
})
</script>
