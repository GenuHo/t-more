<template>
  <div :class="ns.b()" v-if="hasSearchFields">
    <t-popup
      :visible="popupVisible"
      :content="getPopupContent"
      placement="bottom-left"
      destroyOnClose
      :attach="getAttachElement"
      :overlay-class-name="ns.e('popup')"
      trigger="click"
      @visible-change="handlePopupVisibleChange"
    >
      <t-input
        :class="ns.e('search-input')"
        @enter="handleClickSearch"
        ref="searchInputRef"
        v-model="inputValue"
        :placeholder="currentFieldItem?.placeholder"
      >
        <template #label>
          <t-dropdown
            trigger="hover"
            :popupProps="{
              onVisibleChange: handleDropdownVisibleChange,
            }"
            maxColumnWidth="auto"
          >
            <div :class="ns.e('search-label')" @click.stop>
              <search-icon :class="ns.e('icon-search')" />
              <span>{{ currentFieldName }}</span>
              <chevron-down-icon
                :class="ns.e('icon-down')"
                :style="iconDownStyle"
              />
            </div>
            <template #dropdown>
              <t-dropdown-menu>
                <t-dropdown-item
                  v-for="item in searchFields"
                  :key="item.field"
                  @click="handleSelect(item)"
                >
                  {{ resolveFieldName(item) }}
                </t-dropdown-item>
              </t-dropdown-menu>
            </template>
          </t-dropdown>
        </template>
      </t-input>
    </t-popup>
    <t-button
      :class="ns.e('search-button')"
      theme="primary"
      @click="handleClickSearch"
    >
      {{ t('tm.compositeSearch.search') }}
    </t-button>
  </div>
</template>

<script lang="tsx" setup>
import { isArray, isNil } from 'lodash-unified'
import { computed, ref, useTemplateRef, watch } from 'vue'
import { useNamespace, useLocale } from '@tailor-more/t-more-hooks'
import type {
  TmCompositeSearchProps,
  TmCompositeSearchFieldItem,
  TmCompositeSearchSingleFieldItem,
  TmCompositeSearchMultipleFieldItem,
} from './composite-search-type'
import CompositeSearchFilterSingle from './composite-search-filter-single'
import CompositeSearchFilterMultiple from './composite-search-filter-multiple'

defineOptions({
  name: 'TmCompositeSearch',
})

const { t } = useLocale()

const ns = useNamespace('composite-search')

const props = withDefaults(defineProps<TmCompositeSearchProps>(), {
  searchFields: () => [],
})

const getAttachElement = (triggerNode: any) => {
  return triggerNode
}

const currentFieldItem = ref<TmCompositeSearchFieldItem | null>(null)

watch(
  () => props.searchFields,
  () => {
    if (props.searchFields && props.searchFields.length > 0) {
      currentFieldItem.value = props.searchFields[0]
    } else {
      currentFieldItem.value = null
    }
  },
  {
    immediate: true,
  },
)

// name 支持惰性函数（title 为渲染函数时由 table 传入），统一解析为字符串
const resolveFieldName = (item: TmCompositeSearchFieldItem): string => {
  const name = item.name
  return typeof name === 'function' ? name() : name
}

// 当前选中搜索字段的展示名
const currentFieldName = computed(() =>
  currentFieldItem.value ? resolveFieldName(currentFieldItem.value) : '',
)

const searchInputRef = useTemplateRef('searchInputRef')
const handleSelect = (item: TmCompositeSearchFieldItem) => {
  currentFieldItem.value = item
  ;(searchInputRef.value?.$el as HTMLElement | undefined)
    ?.querySelector('input')
    ?.focus()

  if (isSingleOrMultipleFieldItem(currentFieldItem.value)) {
    popupVisible.value = true
  } else {
    popupVisible.value = false // 切换为输入框的时候，就要变为false
  }
}

// 是否有searchFields
const hasSearchFields = computed(
  () => props.searchFields && props.searchFields.length > 0,
)

const dropdownVisible = ref(false)
const handleDropdownVisibleChange = (visible: boolean) => {
  dropdownVisible.value = visible
}
const iconDownStyle = computed(() => ({
  transform: dropdownVisible.value ? 'rotate(180deg)' : 'rotate(0deg)',
}))

const handlePopupVisibleChange = (visible: boolean) => {
  popupVisible.value = visible
}

const inputValue = ref('')
const handleClickSearch = () => {
  if (!currentFieldItem.value) return
  if (currentFieldItem.value.type === 'input') {
    const trimmedValue = inputValue.value.trim()
    if (trimmedValue) {
      props?.onSearch?.({
        field: currentFieldItem.value.field,
        name: resolveFieldName(currentFieldItem.value),
        value: trimmedValue,
      })
      inputValue.value = ''
    }
    return
  } else if (currentFieldItem.value.type === 'single') {
    handleConfirm()
    popupVisible.value = false
    return
  } else if (currentFieldItem.value.type === 'multiple') {
    handleConfirm()
    popupVisible.value = false
    return
  }
}

const handleReset = () => {
  if (!currentFieldItem.value) return
  const field = currentFieldItem.value.field
  const name = resolveFieldName(currentFieldItem.value)
  clearFilterValue(field)
  props?.onReset?.({ field, name })
}

const handleConfirm = () => {
  if (!currentFieldItem.value) return
  const field = currentFieldItem.value.field
  const name = resolveFieldName(currentFieldItem.value)
  // 确认的值就是弹层里展示的值：临时值优先，否则用已确认的值
  const value = getFilterValue(currentFieldItem.value)
  // 未选中任何选项时走清除逻辑
  if (isNil(value) || (isArray(value) && value.length === 0)) {
    clearFilterValue(field)
    props?.onReset?.({ field, name })
    return
  }
  confirmedFilterRecord.value = {
    ...confirmedFilterRecord.value,
    [field]: value,
  }
  props?.onSearch?.({
    field,
    name,
    value,
  })
}

const isSingleOrMultipleFieldItem = (
  item: TmCompositeSearchFieldItem,
): item is
  | TmCompositeSearchSingleFieldItem
  | TmCompositeSearchMultipleFieldItem => {
  return ['single', 'multiple'].includes(item.type)
}

// 弹层内的临时筛选值：change 时记录，点击确认才生效
const tempFilterRecord = ref<Record<string, any>>({})
// 已确认的筛选值：外部条件同步进来，点击确认时更新，打开弹层时用它回显
const confirmedFilterRecord = ref<Record<string, any>>({})
const popupVisible = ref(false)

// 外部条件（初始筛选、清空标签等）变化时同步已确认值，未确认的临时值一并失效
watch(
  () => props.value,
  (value) => {
    const confirmed: Record<string, any> = {}
    value?.forEach((item) => {
      confirmed[item.field] = item.value
    })
    confirmedFilterRecord.value = confirmed
    tempFilterRecord.value = {}
  },
  // deep：使用方可能就地修改传入的条件数组
  { immediate: true, deep: true },
)

// 传给筛选组件的受控值：多选必须是数组，单选未选中时用 undefined
const getFilterValue = (item: TmCompositeSearchFieldItem) => {
  const value =
    tempFilterRecord.value[item.field] ??
    confirmedFilterRecord.value[item.field]
  return value ?? (item.type === 'multiple' ? [] : undefined)
}

// 清掉某字段的已确认值，并丢弃弹层里的临时值
const clearFilterValue = (field: string) => {
  const confirmed = { ...confirmedFilterRecord.value }
  delete confirmed[field]
  confirmedFilterRecord.value = confirmed
  tempFilterRecord.value = {}
}

// 弹层关闭（确认、重置、点搜索、点外部、切换字段等）时丢弃未确认的临时值
watch(popupVisible, (visible) => {
  if (!visible) {
    tempFilterRecord.value = {}
  }
})

const getPopupContent = () => {
  if (!currentFieldItem.value) {
    return
  }
  if (!isSingleOrMultipleFieldItem(currentFieldItem.value)) {
    return
  }
  const filterComponentProps: Record<string, any> = {
    options: currentFieldItem.value?.list || [],
    // 与 tdesign 的自定义筛选器约定一致：只依赖 value 和 change
    value: getFilterValue(currentFieldItem.value),
    onChange: (val: any) => {
      if (!currentFieldItem.value) {
        return
      }
      if (!isSingleOrMultipleFieldItem(currentFieldItem.value)) {
        return
      }
      const field = currentFieldItem.value.field
      // 记录临时筛选值，点击确认前不生效
      tempFilterRecord.value = { ...tempFilterRecord.value, [field]: val }
    },
  }
  const renderComponent = () => {
    if (currentFieldItem.value?.type === 'single') {
      return (
        <CompositeSearchFilterSingle
          {...filterComponentProps}
        ></CompositeSearchFilterSingle>
      )
    } else if (currentFieldItem.value?.type === 'multiple') {
      return (
        <CompositeSearchFilterMultiple
          {...filterComponentProps}
        ></CompositeSearchFilterMultiple>
      )
    }
  }
  const renderBottomButtons = () => {
    return (
      <div class={ns.e('bottom-buttons')}>
        <TButton
          theme="default"
          size="small"
          onClick={() => {
            handleReset()
            popupVisible.value = false
          }}
        >
          {t('tm.compositeSearch.reset')}
        </TButton>
        <TButton
          theme="primary"
          size="small"
          onClick={() => {
            handleConfirm()
            popupVisible.value = false
          }}
        >
          {t('tm.compositeSearch.confirm')}
        </TButton>
      </div>
    )
  }
  return (
    <div onClick={(e: Event) => e.stopPropagation()}>
      <div class={ns.e('filter-pop-content-inner')}>{renderComponent()}</div>
      {renderBottomButtons()}
    </div>
  )
}
</script>

<style lang="less">
@import url('@tailor-more/t-more-theme-chalk/composite-search.less');
</style>
